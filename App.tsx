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
import SignatureFolder from './components/SignatureFolder';
import UserProfile from './components/UserProfile';
import BlockchainMonitor from './components/BlockchainMonitor';
import RegistryManager from './components/RegistryManager';
import SmartProcurement from './components/SmartProcurement';
import SmartBudget from './components/SmartBudget';
import ComplianceCenter from './components/ComplianceCenter';
import { ToastProvider } from './components/ui/ToastSystem';
import { UserProvider, useUser } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';

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
        return <Dashboard onNavigate={setCurrentView} />;
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
        <NotificationProvider>
            <AppContent />
        </NotificationProvider>
      </UserProvider>
    </ToastProvider>
  );
};

export default App;