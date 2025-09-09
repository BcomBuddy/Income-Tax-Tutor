import React from 'react';
import { useTaxTutor } from '../../contexts/BizTutorContext';
import { useTheme } from '../../contexts/ThemeContext';
import Header from './Header';
import TabContent from './TabContent';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const { currentTab } = useTaxTutor();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'dark bg-midnight' : 'bg-white'
    }`}>
      <div className="h-screen grid grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-full border-r border-white/10 bg-[rgba(15,15,31,0.6)] backdrop-blur">
          <Sidebar />
        </aside>
        <div className="flex flex-col h-full">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-7xl">
              <TabContent currentTab={currentTab} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;