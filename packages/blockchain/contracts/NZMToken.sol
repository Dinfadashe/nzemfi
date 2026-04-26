// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NZMToken — NzemFi Platform Token
 * @notice BEP-20 token on BNB Smart Chain for the NzemFi music streaming platform.
 * @dev Stream-to-earn token with halving schedule and anti-bot rate limiting.
 *
 * Tokenomics:
 *   - Free listener: 0.25 NZM per qualifying stream (30s+)
 *   - Premium listener: 0.50 NZM per qualifying stream
 *   - Artist royalty: 30% of fan earning credited per stream
 *   - Emission halves every 100x active user milestone from 100 users
 *   - 5% withdrawal fee to platform treasury
 */
contract NZMToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {

    // ── Roles ─────────────────────────────────────────────────────────────────
    bytes32 public constant MINTER_ROLE   = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // ── Tokenomics ────────────────────────────────────────────────────────────
    uint256 public constant BASE_FREE_RATE_WEI    = 25 * 10**16; // 0.25 NZM
    uint256 public constant BASE_PREMIUM_RATE_WEI = 50 * 10**16; // 0.50 NZM
    uint256 public constant ARTIST_SHARE_BPS      = 3000; // 30% in basis points
    uint256 public constant FAN_SHARE_BPS         = 7000; // 70% in basis points
    uint256 public constant WITHDRAWAL_FEE_BPS    = 500;  // 5%
    uint256 public constant MIN_WITHDRAWAL        = 100 * 10**18; // 100 NZM

    // ── Halving ───────────────────────────────────────────────────────────────
    uint256 public halvingCount;
    uint256 public halvingFactor = 10000; // Basis points: 10000 = 1x, 5000 = 0.5x
    uint256 public constant HALVING_BPS_DIVISOR = 10000;

    // ── Anti-bot rate limiting ────────────────────────────────────────────────
    // Max 1 mint per user per track per 5 minutes
    mapping(address => mapping(bytes32 => uint256)) public lastMintTime;
    uint256 public constant MINT_COOLDOWN = 5 minutes;
    uint256 public constant MAX_DAILY_MINTS = 50;
    mapping(address => uint256) public dailyMintCount;
    mapping(address => uint256) public dailyMintResetTime;

    // ── Treasury ──────────────────────────────────────────────────────────────
    address public treasury;

    // ── Supply cap ───────────────────────────────────────────────────────────
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18; // 10B NZM

    // ── Events ────────────────────────────────────────────────────────────────
    event StreamEarned(
        address indexed fan,
        address indexed artist,
        uint256 fanAmount,
        uint256 artistAmount,
        bytes32 indexed trackId
    );
    event HalvingUpdated(uint256 halvingCount, uint256 newFactor, uint256 activeUsers);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event WithdrawalFeeCollected(address indexed from, uint256 fee);

    // ── Constructor ──────────────────────────────────────────────────────────
    constructor(address _treasury) ERC20("NzemFi Token", "NZM") {
        require(_treasury != address(0), "NZM: invalid treasury");
        treasury = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // ── Mint for stream earning ───────────────────────────────────────────────
    /**
     * @notice Mint NZM tokens for a streaming event.
     * Called by the NzemFi backend (MINTER_ROLE) after verifying a 30s+ stream.
     * Fan receives 70%, artist receives 30%.
     *
     * @param fan       The listener's BSC wallet address
     * @param artist    The artist's BSC wallet address
     * @param isPremium Whether the fan is on the premium tier
     * @param trackId   Unique track identifier (for rate limiting)
     */
    function mintStreamEarning(
        address fan,
        address artist,
        bool isPremium,
        bytes32 trackId
    ) external onlyRole(MINTER_ROLE) nonReentrant whenNotPaused {
        require(fan != address(0), "NZM: invalid fan address");
        require(artist != address(0), "NZM: invalid artist address");

        // Rate limit: cooldown per user per track
        bytes32 mintKey = keccak256(abi.encodePacked(fan, trackId));
        require(
            block.timestamp >= lastMintTime[fan][mintKey] + MINT_COOLDOWN,
            "NZM: mint cooldown active"
        );

        // Daily mint cap
        _resetDailyMintIfNeeded(fan);
        require(dailyMintCount[fan] < MAX_DAILY_MINTS, "NZM: daily earning cap reached");

        // Calculate amounts with halving
        uint256 baseRate = isPremium ? BASE_PREMIUM_RATE_WEI : BASE_FREE_RATE_WEI;
        uint256 totalAmount = (baseRate * halvingFactor) / HALVING_BPS_DIVISOR;

        uint256 fanAmount    = (totalAmount * FAN_SHARE_BPS) / 10000;
        uint256 artistAmount = (totalAmount * ARTIST_SHARE_BPS) / 10000;

        require(totalSupply() + fanAmount + artistAmount <= MAX_SUPPLY, "NZM: max supply exceeded");

        // Update state
        lastMintTime[fan][mintKey] = block.timestamp;
        dailyMintCount[fan]++;

        // Mint
        _mint(fan, fanAmount);
        _mint(artist, artistAmount);

        emit StreamEarned(fan, artist, fanAmount, artistAmount, trackId);
    }

    // ── Admin mint (for bonuses, referrals) ──────────────────────────────────
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "NZM: max supply exceeded");
        _mint(to, amount);
    }

    // ── Halving update ────────────────────────────────────────────────────────
    /**
     * @notice Update halving factor. Called by operator when active user
     * milestones are crossed (100, 10000, 1000000, 100000000...).
     *
     * @param newHalvingCount  New halving count
     * @param activeUsers      Current active user count for transparency
     */
    function updateHalving(uint256 newHalvingCount, uint256 activeUsers)
        external
        onlyRole(OPERATOR_ROLE)
    {
        require(newHalvingCount >= halvingCount, "NZM: cannot reduce halvings");
        halvingCount = newHalvingCount;
        // factor = 10000 / 2^halvingCount
        halvingFactor = HALVING_BPS_DIVISOR >> newHalvingCount;
        emit HalvingUpdated(newHalvingCount, halvingFactor, activeUsers);
    }

    // ── Withdrawal (with fee) ─────────────────────────────────────────────────
    /**
     * @notice Withdraw NZM to an external wallet with a 5% platform fee.
     * @param amount Gross NZM amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_WITHDRAWAL, "NZM: below minimum withdrawal");
        require(balanceOf(msg.sender) >= amount, "NZM: insufficient balance");

        uint256 fee = (amount * WITHDRAWAL_FEE_BPS) / 10000;
        uint256 net = amount - fee;

        // Transfer fee to treasury, net to recipient (already in their wallet)
        _transfer(msg.sender, treasury, fee);
        // Net stays with msg.sender (they already have it)

        emit WithdrawalFeeCollected(msg.sender, fee);
    }

    // ── View functions ────────────────────────────────────────────────────────
    function currentFreeRate() external view returns (uint256) {
        return (BASE_FREE_RATE_WEI * halvingFactor) / HALVING_BPS_DIVISOR;
    }

    function currentPremiumRate() external view returns (uint256) {
        return (BASE_PREMIUM_RATE_WEI * halvingFactor) / HALVING_BPS_DIVISOR;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────
    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasury != address(0), "NZM: invalid treasury");
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    function grantMinterRole(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }

    function revokeMinterRole(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, minter);
    }

    // ── Internal ─────────────────────────────────────────────────────────────
    function _resetDailyMintIfNeeded(address user) internal {
        if (block.timestamp >= dailyMintResetTime[user] + 1 days) {
            dailyMintCount[user] = 0;
            dailyMintResetTime[user] = block.timestamp;
        }
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
