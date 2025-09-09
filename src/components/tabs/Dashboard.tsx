import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  Target, 
  Zap,
  Play,
  Activity,
  Star,
  AlertCircle,
  ArrowRight,
  Trophy,
  BookMarked,
  BarChart3
} from 'lucide-react';
import { useTaxTutor } from '../../contexts/BizTutorContext';

const Dashboard: React.FC = () => {
  const { lessons, attemptLogs, progress, flashcards, setCurrentTab } = useTaxTutor();
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Safe calculations with fallbacks
  const totalAttempts = attemptLogs?.length || 0;
  const totalCorrect = attemptLogs?.reduce((acc, log) => acc + (log.score || 0), 0) || 0;
  const totalQuestions = attemptLogs?.reduce((acc, log) => acc + (log.total || 0), 0) || 0;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const flashcardsDue = flashcards?.filter(card => new Date(card.due) <= new Date()).length || 0;
  
  // Calculate study streak safely
  const calculateStreak = () => {
    if (!attemptLogs || attemptLogs.length === 0) return 0;
    try {
      const sortedLogs = [...attemptLogs].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
      let streak = 0;
      let currentDate = new Date();
      
      for (const log of sortedLogs) {
        const logDate = new Date(log.ts);
        const daysDiff = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
          currentDate = logDate;
        } else if (daysDiff > streak + 1) {
          break;
        }
      }
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  const studyStreak = calculateStreak();

  const stats = [
    { 
      title: 'Study Streak', 
      value: `${studyStreak} days`, 
      icon: Zap,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      subtitle: 'Keep it up!'
    },
    { 
      title: 'Overall Accuracy', 
      value: `${accuracy}%`, 
      icon: Target,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      subtitle: `${totalQuestions} questions`
    },
    { 
      title: 'Lessons Available', 
      value: lessons?.length || 0, 
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      subtitle: 'Ready to learn'
    },
    { 
      title: 'Flashcards Due', 
      value: flashcardsDue, 
      icon: Brain,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      subtitle: flashcardsDue > 0 ? 'Review needed' : 'All caught up!'
    }
  ];

  const recentActivity = attemptLogs && attemptLogs.length > 0
    ? attemptLogs
        .slice(-5)
        .reverse()
        .map(log => ({
          topic: log.topic || 'Unknown Topic',
          score: log.score || 0,
          total: log.total || 0,
          date: new Date(log.ts).toLocaleDateString()
        }))
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-[#4A6FA5]" />
            Learning Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Track your progress and continue your learning journey</p>
        </div>
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="bg-gradient-to-r from-[#4A6FA5] to-[#3d5a8c] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to learn?</h3>
              <p className="text-blue-100">Jump into your next lesson or practice session</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentTab('Learn')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Start Learning
              </button>
              <button
                onClick={() => setCurrentTab('Practice')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Practice Quiz
              </button>
              <button
                onClick={() => setCurrentTab('Flashcards')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center"
              >
                <Brain className="w-4 h-4 mr-2" />
                Review Cards
              </button>
            </div>
            <button
              onClick={() => setShowQuickActions(false)}
              className="text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className={`${stat.bg} rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stat.subtitle}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-[#4A6FA5]" />
            Recent Activity
          </h2>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#4A6FA5] rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{activity.topic}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{activity.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{activity.score}/{activity.total}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        Math.round((activity.score / activity.total) * 100) >= 80 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : Math.round((activity.score / activity.total) * 100) >= 60
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {Math.round((activity.score / activity.total) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activity yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Start learning to see your progress here</p>
              <button
                onClick={() => setCurrentTab('Learn')}
                className="px-4 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
              >
                Start Learning
              </button>
            </div>
          )}
        </div>

        {/* Topic Mastery */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-[#4A6FA5]" />
            Topic Mastery
          </h2>
          
          {progress && Object.keys(progress).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(progress).map(([topic, data]) => {
                const topicAccuracy = data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0;
                return (
                  <div key={topic} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#4A6FA5] rounded-full flex items-center justify-center">
                          <BookMarked className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{topic}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {data.correct} correct out of {data.attempts} attempts
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{topicAccuracy}%</p>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(topicAccuracy / 20)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          topicAccuracy >= 80 
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : topicAccuracy >= 60
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${topicAccuracy}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No progress data yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Start practicing to see your topic mastery progress</p>
              <button
                onClick={() => setCurrentTab('Practice')}
                className="px-4 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
              >
                Start Practicing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;