import React from 'react';
import { Moon, Sun, GraduationCap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="glass px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.06)] border border-white/10 shadow-neon-teal animate-float">
            <GraduationCap className="w-5 h-5 text-neon-teal" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text font-poppins">Income Tax</h1>
            <p className="text-sm text-gray-300">TaxTutor • AI Tax Tutor</p>
          </div>
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] transition-colors border border-white/10"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber" />
          ) : (
            <Moon className="w-5 h-5 text-neon-teal" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;