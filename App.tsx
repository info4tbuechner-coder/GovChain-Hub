import React, { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DocTransferDemo from './components/DocTransferDemo';
import SecurityChecklist from './components/SecurityChecklist';
import InstrumentsCatalog from './components/InstrumentsCatalog';
import KnowledgeBase from './components/KnowledgeBase';
import LoginScreen from './components/LoginScreen';
import SSIDemo from './components/SSIDemo';
import VotingDemo from './components/VotingDemo';
import { ToastProvider } from './components/ui/ToastSystem';
import { UserProvider, useUser } from './contexts/UserContext';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useUser();
  const [currentView, setCurrentView] = useState('landing');

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentView} />;
      case 'dashboard':
        return <Dashboard />;
      case 'transfer':
        return <DocTransferDemo />;
      case 'ssi':
        return <SSIDemo />;
      case 'voting':
        return <VotingDemo />;
      case 'security':
        return <SecurityChecklist />;
      case 'instruments':
        return <InstrumentsCatalog />;
      case 'knowledge':
        return <KnowledgeBase />;
      default:
        return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout activeView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ToastProvider>
  );
};

export default App;