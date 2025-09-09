import React from 'react';
import {
  Home,
  BookOpen,
  PenTool,
  Briefcase,
  MessageCircle,
  Brain,
} from 'lucide-react';
import { useTaxTutor } from '../../contexts/BizTutorContext';

const navItems = [
  { id: 'Chat', label: 'Chat', icon: MessageCircle, accent: 'from-pastel-green to-pastel-blue' },
  { id: 'Dashboard', label: 'Dashboard', icon: Home, accent: 'from-pastel-blue to-pastel-purple' },
  { id: 'Learn', label: 'Learn', icon: BookOpen, accent: 'from-pastel-orange to-pastel-yellow' },
  { id: 'Practice', label: 'Practice', icon: PenTool, accent: 'from-pastel-pink to-pastel-orange' },
  { id: 'CaseLab', label: 'CaseLab', icon: Briefcase, accent: 'from-pastel-purple to-pastel-blue' },
  { id: 'Flashcards', label: 'Flashcards', icon: Brain, accent: 'from-pastel-green to-pastel-yellow' },
];

const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab } = useTaxTutor();

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4">
        <div className="p-3 rounded-xl glass">
          <p className="text-sm font-medium gradient-text font-poppins">TaxTutor</p>
          <p className="text-xs text-gray-300">Income Tax AI Tutor</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-6">
        <ul className="space-y-1">
          {navItems.map(({ id, label, icon: Icon, accent }) => {
            const active = currentTab === id;
            return (
              <li key={id}>
                <button
                  onClick={() => setCurrentTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm glass ${
                    active
                      ? 'shadow-neon-teal'
                      : 'hover:shadow-neon-lime'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-md flex items-center justify-center bg-[rgba(255,255,255,0.06)] border border-white/10`}>
                    <Icon className="w-4 h-4 text-neon-teal" />
                  </span>
                  <span className="font-medium text-white">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-lg p-3 glass">
          <p className="text-xs text-gray-300">Tip: Start in Chat to get personalized guidance.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;







