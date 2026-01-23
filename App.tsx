import React, { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DocTransferDemo from './components/DocTransferDemo';
import SecurityChecklist from './components/SecurityChecklist';
import InstrumentsCatalog from './components/InstrumentsCatalog';
import KnowledgeBase from './components/KnowledgeBase';
import LoginScreen from './components/LoginScreen';
import { ToastProvider } from './components/ui/ToastSystem';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('landing');

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentView} />;
      case 'dashboard':
        return <Dashboard />;
      case 'transfer':
        return <DocTransferDemo />;
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
      <AppContent />
    </ToastProvider>
  );
};

export default App;