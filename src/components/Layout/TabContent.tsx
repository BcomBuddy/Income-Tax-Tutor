import React from 'react';
import Dashboard from '../tabs/Dashboard';
import Learn from '../tabs/Learn';
import Practice from '../tabs/Practice';
import CaseLab from '../tabs/CaseLab';
import Chat from '../tabs/Chat';
import Flashcards from '../tabs/Flashcards';

interface TabContentProps {
  currentTab: string;
}

const TabContent: React.FC<TabContentProps> = ({ currentTab }) => {
  const renderContent = () => {
    switch (currentTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Learn':
        return <Learn />;
      case 'Practice':
        return <Practice />;
      case 'CaseLab':
        return <CaseLab />;
      case 'Chat':
        return <Chat />;
      case 'Flashcards':
        return <Flashcards />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="p-6">
      {renderContent()}
    </div>
  );
};

export default TabContent;