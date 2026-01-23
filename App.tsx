import React, { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DocTransferDemo from './components/DocTransferDemo';
import SecurityChecklist from './components/SecurityChecklist';
import InstrumentsCatalog from './components/InstrumentsCatalog';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('landing');

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

export default App;