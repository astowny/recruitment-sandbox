
import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import RecruitmentSandbox from './components/RecruitmentSandbox';
import { VoiceChatIcon, NetworkIntelligenceIcon } from './components/icons';

type Tab = 'chatbot' | 'recruitment';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('recruitment');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chatbot':
        return <Chatbot />;
      case 'recruitment':
        return <RecruitmentSandbox />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{
    tabName: Tab;
    label: string;
    icon: React.ReactNode;
  }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${
        activeTab === tabName
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-md p-4 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 mb-4 sm:mb-0">
            AI Recruitment & Chat Assistant
          </h1>
          <nav className="flex items-center gap-2">
            <TabButton
              tabName="recruitment"
              label="Recruitment Sandbox"
              icon={<NetworkIntelligenceIcon />}
            />
            <TabButton
              tabName="chatbot"
              label="AI Chatbot"
              icon={<VoiceChatIcon />}
            />
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default App;
