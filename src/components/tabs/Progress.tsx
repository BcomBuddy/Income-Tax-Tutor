import React, { useState } from 'react';
import { TrendingUp, Clock, Target, Download, Calendar } from 'lucide-react';
import { useTaxTutor } from '../../contexts/BizTutorContext';

const Progress: React.FC = () => {
  const { progress, attemptLogs } = useTaxTutor();
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const filterLogsByPeriod = () => {
    if (selectedPeriod === 'all') return attemptLogs;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return attemptLogs;
    }
    
    return attemptLogs.filter(log => new Date(log.ts) >= cutoffDate);
  };

  const filteredLogs = filterLogsByPeriod();
  
  const totalQuestions = filteredLogs.reduce((sum, log) => sum + log.total, 0);
  const totalCorrect = filteredLogs.reduce((sum, log) => sum + log.score, 0);
  const totalTime = filteredLogs.reduce((sum, log) => sum + log.elapsedSec, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const weakAreas = Object.entries(progress)
    .map(([topic, data]) => ({
      topic,
      accuracy: Math.round((data.correct / data.attempts) * 100),
      attempts: data.attempts,
      avgTime: Math.round(data.timeSec / data.attempts)
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const exportData = () => {
    const data = {
      summary: {
        totalQuestions,
        totalCorrect,
        overallAccuracy,
        totalTimeMinutes: Math.round(totalTime / 60)
      },
      topicProgress: progress,
      attemptHistory: filteredLogs
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxtutor-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Progress Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your learning journey and identify areas for improvement</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
          
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Questions Attempted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalQuestions}</p>
            </div>
            <Target className="w-8 h-8 text-[#4A6FA5]" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Overall Accuracy</p>
              <p className="text-2xl font-bold text-green-600">{overallAccuracy}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Study Time</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(totalTime / 60)}m</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Practice Sessions</p>
              <p className="text-2xl font-bold text-purple-600">{filteredLogs.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Topic Performance</h2>
          {Object.keys(progress).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(progress).map(([topic, data]) => {
                const accuracy = Math.round((data.correct / data.attempts) * 100);
                return (
                  <div key={topic} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{topic}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccuracyColor(accuracy)}`}>
                        {accuracy}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                      <div 
                        className="bg-[#4A6FA5] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${accuracy}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{data.correct} correct out of {data.attempts}</span>
                      <span>Avg: {Math.round(data.timeSec / data.attempts)}s per question</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              No practice data yet. Start practicing to see your performance!
            </p>
          )}
        </div>

        {/* Weak Areas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Areas for Improvement</h2>
          {weakAreas.length > 0 ? (
            <div className="space-y-3">
              {weakAreas.slice(0, 5).map((area, index) => (
                <div key={area.topic} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{area.topic}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {area.attempts} attempts • Avg {area.avgTime}s
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{area.accuracy}%</p>
                    <p className="text-xs text-red-500">Needs focus</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              Great job! No weak areas identified yet.
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Topic</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Accuracy</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.slice(-10).reverse().map((log, index) => {
                  const accuracy = Math.round((log.score / log.total) * 100);
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {new Date(log.ts).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{log.topic}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {log.score}/{log.total}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccuracyColor(accuracy)}`}>
                          {accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {Math.round(log.elapsedSec / 60)}m {log.elapsedSec % 60}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">
            No activity in the selected period. Start practicing to see your progress!
          </p>
        )}
      </div>
    </div>
  );
};

export default Progress;