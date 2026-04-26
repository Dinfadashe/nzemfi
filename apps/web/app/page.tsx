'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Player from '@/components/player/Player';
import TopBar from '@/components/layout/TopBar';
import HomePage from '@/components/pages/HomePage';
import ChartsPage from '@/components/pages/ChartsPage';
import WalletPage from '@/components/pages/WalletPage';
import UploadPage from '@/components/pages/UploadPage';
import {
  ExplorePage,
  TokenomicsPage,
  AnalyticsPage,
  LibraryPage,
  LikedPage,
  ProfilePage,
} from '@/components/pages/OtherPages';
import Toast from '@/components/ui/Toast';
import { useUIStore } from '@/lib/store';

export type PageId =
  | 'home' | 'explore' | 'charts' | 'wallet' | 'tokenomics'
  | 'upload' | 'analytics' | 'library' | 'liked' | 'profile';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const { activeModal, openModal } = useUIStore();

  const renderPage = () => {
    switch (activePage) {
      case 'home':       return <HomePage onNavigate={setActivePage} />;
      case 'explore':    return <ExplorePage onNavigate={setActivePage} />;
      case 'charts':     return <ChartsPage />;
      case 'wallet':     return <WalletPage />;
      case 'tokenomics': return <TokenomicsPage />;
      case 'upload':     return <UploadPage />;
      case 'analytics':  return <AnalyticsPage />;
      case 'library':    return <LibraryPage />;
      case 'liked':      return <LikedPage />;
      case 'profile':    return <ProfilePage />;
      default:           return <HomePage onNavigate={setActivePage} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TopBar onNavigate={setActivePage} />
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
          {renderPage()}
        </div>
      </div>
      <Player />
      <Toast />
    </div>
  );
}