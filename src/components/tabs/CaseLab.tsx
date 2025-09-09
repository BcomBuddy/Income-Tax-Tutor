import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  ArrowRight, 
  RotateCcw, 
  Search, 
  Filter, 
  Star, 
  Trophy, 
  Target, 
  Brain, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  Award, 
  Lightbulb, 
  HelpCircle, 
  BookOpen, 
  Users, 
  Zap, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTaxTutor } from '../../contexts/BizTutorContext';
import type { CaseScenario, CaseOption } from '../../types/index';

const CaseLab: React.FC = () => {
  const { cases, addAttemptLog, attemptLogs } = useTaxTutor();
  const [selectedCase, setSelectedCase] = useState<CaseScenario | null>(null);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [decisions, setDecisions] = useState<{ nodeIndex: number; option: CaseOption }[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [caseHistory, setCaseHistory] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [studyMode, setStudyMode] = useState<'guided' | 'challenge' | 'explore'>('guided');

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedCase && !isComplete && !isPaused) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedCase, isComplete, isPaused, startTime]);

  // Load case history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('case-history');
    if (saved) {
      setCaseHistory(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save case history to localStorage
  useEffect(() => {
    localStorage.setItem('case-history', JSON.stringify([...caseHistory]));
  }, [caseHistory]);

  const getCaseDifficulty = (caseScenario: CaseScenario): 'beginner' | 'intermediate' | 'advanced' => {
    const totalNodes = caseScenario.nodes.length;
    const avgOptions = caseScenario.nodes.reduce((sum, node) => sum + node.options.length, 0) / totalNodes;
    const maxScore = caseScenario.nodes.reduce((max, node) => max + Math.max(...node.options.map(opt => opt.score)), 0);
    
    if (totalNodes <= 2 && avgOptions <= 3 && maxScore <= 6) return 'beginner';
    if (totalNodes <= 4 && avgOptions <= 4 && maxScore <= 12) return 'intermediate';
    return 'advanced';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'intermediate': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'advanced': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPerformanceStats = () => {
    const caseAttempts = attemptLogs.filter(log => log.topic.includes('Case'));
    const totalAttempts = caseAttempts.length;
    const avgScore = totalAttempts > 0 
      ? Math.round(caseAttempts.reduce((sum, log) => sum + (log.score / log.total) * 100, 0) / totalAttempts)
      : 0;
    const completedCases = caseHistory.size;
    
    return { totalAttempts, avgScore, completedCases };
  };

  const filteredCases = cases.filter(caseScenario => {
    const matchesSearch = caseScenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         caseScenario.scenario.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || getCaseDifficulty(caseScenario) === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  const startCase = (caseScenario: CaseScenario) => {
    setSelectedCase(caseScenario);
    setCurrentNodeIndex(0);
    setDecisions([]);
    setTotalScore(0);
    setIsComplete(false);
    setShowHints(false);
    setShowExplanation(false);
    setStartTime(Date.now());
    setTimeSpent(0);
    setIsPaused(false);
  };

  const makeDecision = (option: CaseOption) => {
    if (!selectedCase) return;

    const newDecision = { nodeIndex: currentNodeIndex, option };
    const newDecisions = [...decisions, newDecision];
    const newScore = totalScore + option.score;

    setDecisions(newDecisions);
    setTotalScore(newScore);

    // Check if there are more nodes
    if (currentNodeIndex < selectedCase.nodes.length - 1) {
      setCurrentNodeIndex(currentNodeIndex + 1);
    } else {
      // Case complete
      setIsComplete(true);
      setCaseHistory(prev => new Set([...prev, selectedCase.id]));
      
      // Log the attempt
      const maxPossibleScore = selectedCase.nodes.reduce(
        (max, node) => max + Math.max(...node.options.map(opt => opt.score)), 
        0
      );
      
      addAttemptLog({
        ts: new Date().toISOString(),
        topic: `Case: ${selectedCase.title}`,
        score: newScore,
        total: maxPossibleScore,
        elapsedSec: timeSpent,
        answers: decisions.map((decision, index) => ({
          q: selectedCase.nodes[decision.nodeIndex].prompt,
          type: 'case_decision',
          your: decision.option.label,
          correct: true // All decisions are valid in case studies
        }))
      });
    }
  };

  const resetCase = () => {
    setSelectedCase(null);
    setCurrentNodeIndex(0);
    setDecisions([]);
    setTotalScore(0);
    setIsComplete(false);
    setShowHints(false);
    setShowExplanation(false);
    setTimeSpent(0);
    setIsPaused(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHint = (nodeIndex: number) => {
    if (!selectedCase) return '';
    const node = selectedCase.nodes[nodeIndex];
    const bestOption = node.options.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    return `💡 Consider the option with the highest impact score: "${bestOption.label}"`;
  };

  const getExplanation = (option: CaseOption) => {
    const score = option.score;
    if (score >= 4) return "🌟 Excellent choice! This decision maximizes positive outcomes.";
    if (score >= 3) return "✅ Good decision! This option provides solid benefits.";
    if (score >= 2) return "⚠️ Moderate choice. Consider if there are better alternatives.";
    return "❌ This decision may have negative consequences. Review your options.";
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getScoreLabel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'Excellent Decision Making';
    if (percentage >= 60) return 'Good Decision Making';
    return 'Needs Improvement';
  };

  if (selectedCase) {
    if (isComplete) {
      const maxPossibleScore = selectedCase.nodes.reduce(
        (max, node) => max + Math.max(...node.options.map(opt => opt.score)), 
        0
      );
      const performance = (totalScore / maxPossibleScore) * 100;

      return (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                performance >= 80 ? 'bg-green-100 dark:bg-green-900/20' :
                performance >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                'bg-red-100 dark:bg-red-900/20'
              }`}>
                {performance >= 80 ? (
                  <Trophy className="w-10 h-10 text-green-600" />
                ) : performance >= 60 ? (
                  <Star className="w-10 h-10 text-yellow-600" />
                ) : (
                  <Target className="w-10 h-10 text-red-600" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Case Complete!</h2>
              <p className="text-gray-600 dark:text-gray-300">{selectedCase.title}</p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalScore}/{maxPossibleScore}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Final Score</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{Math.round(performance)}%</p>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">Performance</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-xl">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{formatTime(timeSpent)}</p>
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Time Taken</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{decisions.length}</p>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Decisions Made</p>
              </div>
            </div>

            {/* Performance Message */}
            <div className={`p-4 rounded-lg mb-8 ${
              performance >= 80 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
              performance >= 60 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
              'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-center font-medium ${
                performance >= 80 ? 'text-green-800 dark:text-green-200' :
                performance >= 60 ? 'text-yellow-800 dark:text-yellow-200' :
                'text-red-800 dark:text-red-200'
              }`}>
                {performance >= 80 && '🎉 Outstanding decision-making! You demonstrated excellent business judgment!'}
                {performance >= 60 && performance < 80 && '👍 Good work! Your decisions show solid business understanding!'}
                {performance < 60 && '💪 Keep practicing! Review the case to improve your decision-making skills!'}
              </p>
            </div>

            {/* Decision Review */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Decision Analysis</h3>
              <div className="space-y-6">
                {decisions.map((decision, index) => {
                  const node = selectedCase.nodes[decision.nodeIndex];
                  const isGoodDecision = decision.option.score >= 3;
                  
                  return (
                    <div key={index} className={`p-6 border-2 rounded-xl ${
                      isGoodDecision 
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Decision {index + 1}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isGoodDecision ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {isGoodDecision ? 'Good' : 'Needs Improvement'}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white mb-2">{node.prompt}</p>
                        </div>
                        {isGoodDecision ? (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-4" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 ml-4" />
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your choice:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg font-medium">
                            {decision.option.label}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Impact:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                            {decision.option.impact}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Impact Score:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {decision.option.score} points
                          </span>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-blue-800 dark:text-blue-200 text-sm">
                            {getExplanation(decision.option)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Manager's Notes */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Manager's Analysis
              </h3>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">{selectedCase.explain}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetCase}
                className="flex items-center justify-center px-6 py-3 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Another Case
              </button>
              <button
                onClick={() => {
                  resetCase();
                  setSelectedCase(null);
                }}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Browse All Cases
              </button>
            </div>
          </div>
        </div>
      );
    }

    const currentNode = selectedCase.nodes[currentNodeIndex];
    const progress = ((currentNodeIndex + 1) / selectedCase.nodes.length) * 100;

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={resetCase}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Exit Case
            </button>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeSpent)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Step {currentNodeIndex + 1} of {selectedCase.nodes.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {Math.round(progress)}% Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
          <div 
            className="bg-gradient-to-r from-[#4A6FA5] to-[#3d5a8c] h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 sticky top-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Case Info</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    <Target className="w-4 h-4 mr-2" />
                    Current Score
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{totalScore} points</p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                    <Trophy className="w-4 h-4 mr-2" />
                    Decisions Made
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">{decisions.length}</p>
                </div>
                
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    Time Spent
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300">{formatTime(timeSpent)}</p>
                </div>
              </div>

              {/* Study Tools */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="w-full flex items-center px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showHints ? 'Hide' : 'Show'} Hints
                </button>
                
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full flex items-center px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {showExplanation ? 'Hide' : 'Show'} Explanations
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{selectedCase.title}</h1>
              
              {currentNodeIndex === 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Scenario
                  </h2>
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed">{selectedCase.scenario}</p>
                </div>
              )}

              {/* Hint Display */}
              {showHints && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    {getHint(currentNodeIndex)}
                  </p>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{currentNode.prompt}</h2>
                
                <div className="space-y-4">
                  {currentNode.options.map((option, index) => (
                    <div
                      key={index}
                      className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-[#4A6FA5] hover:bg-[#4A6FA5]/5 transition-all duration-300 cursor-pointer group"
                      onClick={() => makeDecision(option)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white mb-3 group-hover:text-[#4A6FA5] transition-colors">
                            {option.label}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{option.impact}</p>
                          
                          {/* Explanation Display */}
                          {showExplanation && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <p className="text-blue-800 dark:text-blue-200 text-sm">
                                {getExplanation(option)}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center ml-4">
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">
                            {option.score} pts
                          </span>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#4A6FA5] transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Decisions */}
              {decisions.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Previous Decisions
                  </h3>
                  <div className="space-y-3">
                    {decisions.map((decision, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Step {index + 1}: {decision.option.label}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          +{decision.option.score} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getPerformanceStats();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <Briefcase className="w-8 h-8 mr-3 text-[#4A6FA5]" />
          Case Lab
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Practice business decision-making with interactive case scenarios</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalAttempts}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Cases Attempted</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgScore}%</p>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Avg Performance</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.completedCases}</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Cases Completed</p>
            </div>
            <Trophy className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{cases.length}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Available Cases</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((caseScenario, index) => {
          const difficulty = getCaseDifficulty(caseScenario);
          const isCompleted = caseHistory.has(caseScenario.id);
          
          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all duration-300 cursor-pointer group ${
                isCompleted 
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#4A6FA5] hover:shadow-lg'
              }`}
              onClick={() => startCase(caseScenario)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className={`w-8 h-8 group-hover:scale-110 transition-transform ${
                    isCompleted ? 'text-green-600' : 'text-[#4A6FA5]'
                  }`} />
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                    {difficulty}
                  </span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {caseScenario.nodes.length} Decision{caseScenario.nodes.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <h3 className={`text-xl font-semibold mb-3 group-hover:text-[#4A6FA5] transition-colors ${
                isCompleted ? 'text-green-800 dark:text-green-200' : 'text-gray-900 dark:text-white'
              }`}>
                {caseScenario.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
                {caseScenario.scenario}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {caseScenario.nodes.reduce((total, node) => total + node.options.length, 0)} options to explore
                </span>
                <div className="flex items-center space-x-2">
                  {isCompleted && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Completed</span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#4A6FA5] transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cases found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty('all');
            }}
            className="px-4 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CaseLab;