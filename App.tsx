
import React, { useState, useEffect } from 'react';
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
import SignatureFolder from './components/SignatureFolder';
import UserProfile from './components/UserProfile';
import BlockchainMonitor from './components/BlockchainMonitor';
import RegistryManager from './components/RegistryManager';
import SmartProcurement from './components/SmartProcurement';
import SmartBudget from './components/SmartBudget';
import ComplianceCenter from './components/ComplianceCenter';
import GovAiAssistant from './components/GovAiAssistant';
import CrisisCenter from './components/CrisisCenter';
import DataExchange from './components/DataExchange';
import { ToastProvider } from './components/ui/ToastSystem';
import { UserProvider, useUser } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ui/ErrorBoundary';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useUser();
  const [currentView, setCurrentView] = useState('landing');

  // Sync state with URL hash for Deep-Linking and Back Button
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') || 'landing';
      setCurrentView(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    if (window.location.hash) {
      handleHashChange();
    }
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string) => {
    window.location.hash = `#/${view}`;
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={navigateTo} />;
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'profile':
        return <UserProfile />;
      case 'signatures':
        return <SignatureFolder />;
      case 'registry':
        return <RegistryManager />;
      case 'procurement':
        return <SmartProcurement />;
      case 'budget':
        return <SmartBudget />;
      case 'compliance':
        return <ComplianceCenter />;
      case 'crisis':
        return <CrisisCenter />;
      case 'data-exchange':
        return <DataExchange />;
      case 'ai-assistant':
        return <GovAiAssistant />;
      case 'transfer':
        return <DocTransferDemo />;
      case 'ssi':
        return <SSIDemo />;
      case 'voting':
        return <VotingDemo />;
      case 'network':
        return <BlockchainMonitor />;
      case 'security':
        return <SecurityChecklist />;
      case 'instruments':
        return <InstrumentsCatalog />;
      case 'knowledge':
        return <KnowledgeBase />;
      default:
        return <LandingPage onNavigate={navigateTo} />;
    }
  };

  return (
    <Layout activeView={currentView} onNavigate={navigateTo}>
      <ErrorBoundary>
        {renderView()}
      </ErrorBoundary>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <UserProvider>
          <NotificationProvider>
              <AppContent />
          </NotificationProvider>
        </UserProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
