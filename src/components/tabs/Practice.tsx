import React, { useState, useEffect } from 'react';
import { 
  PenTool, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Target, 
  Trophy, 
  Star, 
  TrendingUp, 
  Brain, 
  Zap, 
  BookOpen, 
  Timer, 
  Play, 
  Pause, 
  ArrowLeft, 
  ArrowRight,
  BarChart3,
  Flame,
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTaxTutor } from '../../contexts/BizTutorContext';
import type { Question, AttemptLog } from '../../types/index';

const Practice: React.FC = () => {
  const { questions, addAttemptLog, updateProgress, attemptLogs } = useTaxTutor();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'timed' | 'untimed' | 'review' | 'adaptive'>('untimed');
  const [timeLimit, setTimeLimit] = useState<number>(300); // 5 minutes default
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [questionCount, setQuestionCount] = useState(5);
  const [showAnswer, setShowAnswer] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && practiceMode === 'timed' && timeRemaining > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitPractice();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, practiceMode, timeRemaining, isPaused]);

  // Load max streak from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('max-streak');
    if (saved) {
      setMaxStreak(parseInt(saved));
    }
  }, []);

  const questionTypes = [
    { id: 'all', label: 'All Types', count: questions.length, icon: BookOpen, color: 'text-blue-500' },
    { id: 'mcq', label: 'Multiple Choice', count: questions.filter(q => q.type === 'mcq').length, icon: Target, color: 'text-green-500' },
    { id: 'short', label: 'Short Answer', count: questions.filter(q => q.type === 'short').length, icon: PenTool, color: 'text-orange-500' },
    { id: 'long', label: 'Long Answer', count: questions.filter(q => q.type === 'long').length, icon: Brain, color: 'text-purple-500' }
  ];

  const practiceModes = [
    { id: 'untimed', label: 'Untimed', description: 'Take your time to think', icon: Clock, color: 'text-gray-500' },
    { id: 'timed', label: 'Timed', description: 'Race against the clock', icon: Timer, color: 'text-red-500' },
    { id: 'review', label: 'Review', description: 'Study with hints', icon: Eye, color: 'text-blue-500' },
    { id: 'adaptive', label: 'Adaptive', description: 'AI-powered difficulty', icon: Zap, color: 'text-yellow-500' }
  ];


  const getBloomColor = (bloom: string) => {
    switch (bloom) {
      case 'Remember': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'Understand': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'Apply': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'Evaluate': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceStats = () => {
    const recentAttempts = attemptLogs.slice(-10);
    const totalAttempts = recentAttempts.length;
    const avgAccuracy = totalAttempts > 0 
      ? Math.round(recentAttempts.reduce((sum, log) => sum + (log.score / log.total) * 100, 0) / totalAttempts)
      : 0;
    const totalQuestions = recentAttempts.reduce((sum, log) => sum + log.total, 0);
    
    return { totalAttempts, avgAccuracy, totalQuestions };
  };

  const startPractice = (type: string, count: number = questionCount) => {
    let filteredQuestions = type === 'all' 
      ? questions 
      : questions.filter(q => q.type === type);
    
    // Apply difficulty filter
    if (difficulty !== 'mixed') {
      filteredQuestions = filteredQuestions.filter(q => {
        if (difficulty === 'easy') return q.bloom === 'Remember';
        if (difficulty === 'medium') return q.bloom === 'Understand' || q.bloom === 'Apply';
        if (difficulty === 'hard') return q.bloom === 'Evaluate';
        return true;
      });
    }
    
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    
    setCurrentQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    setIsActive(true);
    setStartTime(Date.now());
    setStreak(0);
    setShowAnswer(false);
    
    // Set timer for timed mode
    if (practiceMode === 'timed') {
      setTimeRemaining(timeLimit);
    }
  };

  const handleAnswer = (questionIndex: number, answer: string) => {
    setAnswers({ ...answers, [questionIndex]: answer });
    
    // Check if answer is correct for streak tracking
    if (practiceMode === 'review' || showAnswer) {
      const question = currentQuestions[questionIndex];
      const isCorrect = checkAnswer(question, answer);
      
      if (isCorrect) {
        setStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak > maxStreak) {
            setMaxStreak(newStreak);
            localStorage.setItem('max-streak', newStreak.toString());
          }
          return newStreak;
        });
      } else {
        setStreak(0);
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const submitPractice = () => {
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    let correctCount = 0;

    const attemptAnswers = currentQuestions.map((question, index) => {
      const userAnswer = answers[index] || '';
      const isCorrect = checkAnswer(question, userAnswer);

      if (isCorrect) correctCount++;

      return {
        q: question.q,
        type: question.type,
        your: userAnswer,
        correct: isCorrect
      };
    });

    // Update streak based on final results
    const accuracy = (correctCount / currentQuestions.length) * 100;
    if (accuracy >= 80) {
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
          localStorage.setItem('max-streak', newStreak.toString());
        }
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    // Create attempt log
    const attemptLog: AttemptLog = {
      ts: new Date().toISOString(),
      topic: `${selectedType} Practice`,
      score: correctCount,
      total: currentQuestions.length,
      elapsedSec,
      answers: attemptAnswers
    };

    addAttemptLog(attemptLog);
    updateProgress(`${selectedType} Practice`, correctCount > 0, elapsedSec);
    setShowResults(true);
    setIsActive(false);
  };

  const resetPractice = () => {
    setCurrentQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    setIsActive(false);
  };

  const checkAnswer = (question: Question, userAnswer: string): boolean => {
    if (!userAnswer.trim()) return false;
    
    if (question.type === 'mcq') {
      return userAnswer === question.answer;
    } else if (question.type === 'short') {
      const keywords = question.answer.toLowerCase().split(';').map(k => k.trim());
      const userLower = userAnswer.toLowerCase();
      return keywords.some(keyword => userLower.includes(keyword));
    } else if (question.type === 'long') {
      // For long answers, check if it meets minimum length and contains key concepts
      const minLength = 20;
      const keyConcepts = question.answer.toLowerCase().split(' ').filter(word => word.length > 3);
      const userLower = userAnswer.toLowerCase();
      return userAnswer.trim().length >= minLength && 
             keyConcepts.some(concept => userLower.includes(concept));
    }
    return false;
  };

  if (isActive && currentQuestions.length > 0) {
    const currentQuestion = currentQuestions[currentIndex];
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
    const isCorrect = showAnswer ? checkAnswer(currentQuestion, answers[currentIndex] || '') : false;

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={resetPractice}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Exit Practice
            </button>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-1" />
              Question {currentIndex + 1} of {currentQuestions.length}
            </div>
            {practiceMode === 'timed' && (
              <div className={`flex items-center text-sm font-medium ${
                timeRemaining < 60 ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'
              }`}>
                <Timer className="w-4 h-4 mr-1" />
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {streak > 0 && (
              <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                <Flame className="w-4 h-4 mr-1" />
                {streak} streak
              </div>
            )}
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Practice Info</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    <Target className="w-4 h-4 mr-2" />
                    Mode
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 capitalize">{practiceMode}</p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                    <Trophy className="w-4 h-4 mr-2" />
                    Streak
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">{streak} correct</p>
                </div>
                
                {maxStreak > 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      <Star className="w-4 h-4 mr-2" />
                      Best Streak
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{maxStreak}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBloomColor(currentQuestion.bloom || 'General')}`}>
                      {currentQuestion.type.toUpperCase()}
                    </span>
                    {currentQuestion.bloom && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBloomColor(currentQuestion.bloom)}`}>
                        {currentQuestion.bloom}
                      </span>
                    )}
                  </div>
                  
                  {practiceMode === 'review' && (
                    <button
                      onClick={() => setShowAnswer(!showAnswer)}
                      className="flex items-center px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      {showAnswer ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {showAnswer ? 'Hide Answer' : 'Show Answer'}
                    </button>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {currentQuestion.q}
                </h2>
                
                {showAnswer && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
                    <p className="text-green-800 dark:text-green-200 font-medium mb-1">Correct Answer:</p>
                    <p className="text-green-700 dark:text-green-300">{currentQuestion.answer}</p>
                  </div>
                )}
              </div>

              {/* Answer Section */}
              <div className="mb-8">
                {currentQuestion.type === 'mcq' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answers[currentIndex] === option;
                      const isCorrectOption = option === currentQuestion.answer;
                      const showFeedback = showAnswer || practiceMode === 'review';
                      
                      return (
                        <label key={index} className={`flex items-center cursor-pointer p-4 border-2 rounded-lg transition-all ${
                          showFeedback && isCorrectOption
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : showFeedback && isSelected && !isCorrectOption
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : isSelected
                            ? 'border-[#4A6FA5] bg-[#4A6FA5]/10'
                            : 'border-gray-200 dark:border-gray-600 hover:border-[#4A6FA5]'
                        }`}>
                          <input
                            type="radio"
                            name={`question-${currentIndex}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => handleAnswer(currentIndex, option)}
                            className="mr-3 text-[#4A6FA5] focus:ring-[#4A6FA5]"
                            disabled={showFeedback}
                          />
                          <span className={`${
                            showFeedback && isCorrectOption
                              ? 'text-green-800 dark:text-green-200 font-medium'
                              : showFeedback && isSelected && !isCorrectOption
                              ? 'text-red-800 dark:text-red-200'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {option}
                          </span>
                          {showFeedback && isCorrectOption && (
                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}

                {(currentQuestion.type === 'short' || currentQuestion.type === 'long') && (
                  <div>
                    <textarea
                      placeholder={currentQuestion.type === 'short' ? "Enter your short answer..." : "Provide a detailed answer..."}
                      value={answers[currentIndex] || ''}
                      onChange={(e) => handleAnswer(currentIndex, e.target.value)}
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
                      rows={currentQuestion.type === 'short' ? 3 : 6}
                      disabled={showAnswer && practiceMode === 'review'}
                    />
                    
                    {showAnswer && practiceMode === 'review' && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                          <strong>Your answer:</strong> {answers[currentIndex] || 'No answer provided'}
                        </p>
                        <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                          <strong>Correct answer:</strong> {currentQuestion.answer}
                        </p>
                        {isCorrect ? (
                          <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Correct!
                          </p>
                        ) : (
                          <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            Incorrect
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={previousQuestion}
                  disabled={currentIndex === 0}
                  className="flex items-center px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-2">
                  {practiceMode === 'timed' && (
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                  )}
                  
                  {currentIndex < currentQuestions.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      className="flex items-center px-6 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={submitPractice}
                      className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Submit Practice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctCount = currentQuestions.reduce((count, question, index) => {
      return count + (checkAnswer(question, answers[index] || '') ? 1 : 0);
    }, 0);

    const accuracy = Math.round((correctCount / currentQuestions.length) * 100);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const performance = accuracy >= 80 ? 'excellent' : accuracy >= 60 ? 'good' : 'needs-improvement';

    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              performance === 'excellent' ? 'bg-green-100 dark:bg-green-900/20' :
              performance === 'good' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
              'bg-red-100 dark:bg-red-900/20'
            }`}>
              {performance === 'excellent' ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : performance === 'good' ? (
                <Star className="w-10 h-10 text-yellow-600" />
              ) : (
                <Target className="w-10 h-10 text-red-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Practice Complete!</h2>
            <p className="text-gray-600 dark:text-gray-300">Here's how you performed</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{correctCount}/{currentQuestions.length}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Correct Answers</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{accuracy}%</p>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Accuracy</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-xl">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{formatTime(timeTaken)}</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Time Taken</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{streak}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Final Streak</p>
            </div>
          </div>

          {/* Performance Message */}
          <div className={`p-4 rounded-lg mb-8 ${
            performance === 'excellent' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
            performance === 'good' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
            'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className={`text-center font-medium ${
              performance === 'excellent' ? 'text-green-800 dark:text-green-200' :
              performance === 'good' ? 'text-yellow-800 dark:text-yellow-200' :
              'text-red-800 dark:text-red-200'
            }`}>
              {performance === 'excellent' && '🎉 Excellent work! You\'re mastering this topic!'}
              {performance === 'good' && '👍 Good job! Keep practicing to improve further!'}
              {performance === 'needs-improvement' && '💪 Don\'t give up! Review the material and try again!'}
            </p>
          </div>

          {/* Question Review */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Question Review</h3>
            {currentQuestions.map((question, index) => {
              const userAnswer = answers[index] || '';
              const isCorrect = checkAnswer(question, userAnswer);
              
              return (
                <div key={index} className={`p-6 border-2 rounded-xl ${
                  isCorrect 
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Question {index + 1}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBloomColor(question.bloom || 'General')}`}>
                          {question.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{question.q}</p>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-4" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 ml-4" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your answer:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                        {userAnswer || 'No answer provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correct answer:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                        {question.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetPractice}
              className="flex items-center justify-center px-6 py-3 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Practice Again
            </button>
            <button
              onClick={() => {
                resetPractice();
                setSelectedType('all');
              }}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Try Different Type
            </button>
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
          <Target className="w-8 h-8 mr-3 text-[#4A6FA5]" />
          Practice
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Test your knowledge with different question types and study modes</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalAttempts}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Attempts</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgAccuracy}%</p>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Avg Accuracy</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalQuestions}</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Questions Answered</p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{maxStreak}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Best Streak</p>
            </div>
            <Flame className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Practice Modes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Choose Your Study Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {practiceModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  practiceMode === mode.id
                    ? 'border-[#4A6FA5] bg-[#4A6FA5]/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-[#4A6FA5] hover:bg-[#4A6FA5]/5'
                }`}
                onClick={() => setPracticeMode(mode.id as any)}
              >
                <div className="flex items-center mb-3">
                  <Icon className={`w-6 h-6 mr-3 ${mode.color}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{mode.label}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{mode.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Types */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Question Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {questionTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all duration-300 cursor-pointer group ${
                  selectedType === type.id
                    ? 'border-[#4A6FA5] shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-[#4A6FA5]'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${type.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {type.count} Questions
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {type.label}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {type.id === 'all' && 'Practice with all question types'}
                  {type.id === 'mcq' && 'Multiple choice questions with instant feedback'}
                  {type.id === 'short' && 'Short answer questions with keyword matching'}
                  {type.id === 'long' && 'Long form answers with detailed feedback'}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startPractice(type.id, questionCount);
                  }}
                  className="w-full px-4 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
                >
                  Start Practice
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Practice Settings</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showSettings ? 'Hide' : 'Show'} Settings
          </button>
        </div>

        {showSettings && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Question Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
              >
                <option value={3}>3 Questions (Quick)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Extended)</option>
                <option value={15}>15 Questions (Marathon)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
              >
                <option value="mixed">Mixed Difficulty</option>
                <option value="easy">Easy (Remember)</option>
                <option value="medium">Medium (Understand/Apply)</option>
                <option value="hard">Hard (Evaluate)</option>
              </select>
            </div>

            {/* Time Limit for Timed Mode */}
            {practiceMode === 'timed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Limit (minutes)
                </label>
                <select
                  value={timeLimit / 60}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) * 60)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
                >
                  <option value={2}>2 minutes</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Quick Start Buttons */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => startPractice(selectedType, 3)}
            className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Quick Practice</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">3 questions</p>
            </div>
          </button>
          
          <button
            onClick={() => startPractice(selectedType, 5)}
            className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Standard Practice</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">5 questions</p>
            </div>
          </button>
          
          <button
            onClick={() => startPractice(selectedType, 10)}
            className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Trophy className="w-5 h-5 mr-2 text-purple-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Extended Practice</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">10 questions</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Practice;