import { expect } from "chai";
import { ethers } from "hardhat";
import { NZMToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("NZMToken", () => {
  let nzm: NZMToken;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let minter: SignerWithAddress;
  let fan: SignerWithAddress;
  let artist: SignerWithAddress;

  const TRACK_ID = ethers.keccak256(ethers.toUtf8Bytes("track-001"));

  beforeEach(async () => {
    [owner, treasury, minter, fan, artist] = await ethers.getSigners();
    const NZMToken = await ethers.getContractFactory("NZMToken");
    nzm = await NZMToken.deploy(treasury.address);
    await nzm.grantMinterRole(minter.address);
  });

  describe("Deployment", () => {
    it("Should set correct name and symbol", async () => {
      expect(await nzm.name()).to.equal("NzemFi Token");
      expect(await nzm.symbol()).to.equal("NZM");
    });

    it("Should set treasury correctly", async () => {
      expect(await nzm.treasury()).to.equal(treasury.address);
    });

    it("Should have correct initial rates", async () => {
      const freeRate = await nzm.currentFreeRate();
      const premiumRate = await nzm.currentPremiumRate();
      expect(ethers.formatEther(freeRate)).to.equal("0.25");
      expect(ethers.formatEther(premiumRate)).to.equal("0.5");
    });
  });

  describe("Stream Earning", () => {
    it("Should mint correct amounts for free stream", async () => {
      await nzm.connect(minter).mintStreamEarning(fan.address, artist.address, false, TRACK_ID);

      const fanBal = await nzm.balanceOf(fan.address);
      const artistBal = await nzm.balanceOf(artist.address);

      // Fan gets 70% of 0.25 = 0.175 NZM
      expect(ethers.formatEther(fanBal)).to.equal("0.175");
      // Artist gets 30% of 0.25 = 0.075 NZM
      expect(ethers.formatEther(artistBal)).to.equal("0.075");
    });

    it("Should mint correct amounts for premium stream", async () => {
      await nzm.connect(minter).mintStreamEarning(fan.address, artist.address, true, TRACK_ID);

      const fanBal = await nzm.balanceOf(fan.address);
      const artistBal = await nzm.balanceOf(artist.address);

      // Fan gets 70% of 0.50 = 0.35 NZM
      expect(ethers.formatEther(fanBal)).to.equal("0.35");
      // Artist gets 30% of 0.50 = 0.15 NZM
      expect(ethers.formatEther(artistBal)).to.equal("0.15");
    });

    it("Should enforce mint cooldown per track", async () => {
      await nzm.connect(minter).mintStreamEarning(fan.address, artist.address, false, TRACK_ID);

      await expect(
        nzm.connect(minter).mintStreamEarning(fan.address, artist.address, false, TRACK_ID)
      ).to.be.revertedWith("NZM: mint cooldown active");
    });

    it("Should allow minting different tracks without cooldown conflict", async () => {
      const TRACK_ID_2 = ethers.keccak256(ethers.toUtf8Bytes("track-002"));

      await nzm.connect(minter).mintStreamEarning(fan.address, artist.address, false, TRACK_ID);
      // Different track should succeed immediately
      await expect(
        nzm.connect(minter).mintStreamEarning(fan.address, artist.address, false, TRACK_ID_2)
      ).to.not.be.reverted;
    });

    it("Should revert if called by non-minter", async () => {
      await expect(
        nzm.connect(fan).mintStreamEarning(fan.address, artist.address, false, TRACK_ID)
      ).to.be.reverted;
    });

    it("Should emit StreamEarned event", async () => {
      await expect(
        nzm.connect(minter).mintStreamEarning(fan.address, artist.address, false, TRACK_ID)
      ).to.emit(nzm, "StreamEarned");
    });
  });

  describe("Halving", () => {
    it("Should update halving factor correctly", async () => {
      // 1st halving: factor = 0.5
      await nzm.updateHalving(1, 10000);
      expect(await nzm.halvingCount()).to.equal(1);
      const freeRate = await nzm.currentFreeRate();
      expect(ethers.formatEther(freeRate)).to.equal("0.125");
    });

    it("Should halve rates correctly after 2nd halving", async () => {
      await nzm.updateHalving(2, 1000000);
      const freeRate = await nzm.currentFreeRate();
      expect(ethers.formatEther(freeRate)).to.equal("0.0625");
    });

    it("Should not allow reducing halving count", async () => {
      await nzm.updateHalving(2, 1000000);
      await expect(nzm.updateHalving(1, 500000)).to.be.revertedWith("NZM: cannot reduce halvings");
    });

    it("Should mint with halved rate after halving", async () => {
      await nzm.updateHalving(1, 10000);
      await nzm.connect(minter).mintStreamEarning(fan.address, artist.address, false, TRACK_ID);

      const fanBal = await nzm.balanceOf(fan.address);
      // After 1 halving: 70% of 0.125 = 0.0875 NZM
      expect(ethers.formatEther(fanBal)).to.equal("0.0875");
    });
  });

  describe("Withdrawal Fee", () => {
    it("Should collect 5% fee on withdrawal", async () => {
      // Give fan 200 NZM
      await nzm.connect(owner).mint(fan.address, ethers.parseEther("200"));

      const treasuryBefore = await nzm.balanceOf(treasury.address);
      await nzm.connect(fan).withdraw(ethers.parseEther("100"));

      const treasuryAfter = await nzm.balanceOf(treasury.address);
      const feeCollected = treasuryAfter - treasuryBefore;

      // 5% of 100 = 5 NZM
      expect(ethers.formatEther(feeCollected)).to.equal("5.0");
    });

    it("Should reject withdrawal below minimum", async () => {
      await nzm.connect(owner).mint(fan.address, ethers.parseEther("50"));
      await expect(
        nzm.connect(fan).withdraw(ethers.parseEther("50"))
      ).to.be.revertedWith("NZM: below minimum withdrawal");
    });
  });

  describe("Pause / Unpause", () => {
    it("Should prevent minting when paused", async () => {
      await nzm.pause();
      await expect(
        nzm.connect(minter).mintStreamEarning(fan.address, artist.address, false, TRACK_ID)
      ).to.be.reverted;
    });

    it("Should resume minting after unpause", async () => {
      await nzm.pause();
      await nzm.unpause();
      await expect(
        nzm.connect(minter).mintStreamEarning(fan.address, artist.address, false, TRACK_ID)
      ).to.not.be.reverted;
    });
  });
});
