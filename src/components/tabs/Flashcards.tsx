import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Plus, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Star, 
  Clock, 
  Target, 
  TrendingUp, 
  BarChart3, 
  BookOpen, 
  Zap, 
  Play, 
  Pause, 
  SkipForward, 
  ArrowLeft, 
  ArrowRight,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Award,
  Flame,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { useTaxTutor } from '../../contexts/BizTutorContext';
import type { Flashcard } from '../../types/index';

const Flashcards: React.FC = () => {
  const { flashcards, updateFlashcard, dispatch } = useTaxTutor();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '', tag: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [studyType, setStudyType] = useState<'due' | 'new' | 'review' | 'cram'>('due');
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<number>(0);
  const [studyTime, setStudyTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (studyMode && !isPaused) {
      interval = setInterval(() => {
        setStudyTime(Math.floor((Date.now() - studyStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [studyMode, isPaused, studyStartTime]);

  // Load max streak from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flashcard-max-streak');
    if (saved) {
      setMaxStreak(parseInt(saved));
    }
  }, []);

  // SRS Algorithm (simplified SM-2)
  const updateCardSRS = (card: Flashcard, quality: number) => {
    let newEasiness = card.easiness;
    let newInterval = card.interval;
    let newReps = card.reps;

    if (quality < 3) {
      // Reset if quality is poor
      newInterval = 1;
      newReps = 0;
    } else {
      newReps += 1;
      if (newReps === 1) {
        newInterval = 1;
      } else if (newReps === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(card.interval * newEasiness);
      }
    }

    // Update easiness factor
    newEasiness = Math.max(1.3, newEasiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    // Calculate next due date
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + newInterval);

    const updatedCard: Partial<Flashcard> = {
      easiness: newEasiness,
      interval: newInterval,
      reps: newReps,
      due: nextDue.toISOString()
    };

    updateFlashcard(card.front, updatedCard);
  };

  const getPerformanceStats = () => {
    const totalCards = flashcards.length;
    const dueCards = getDueCards();
    const newCards = flashcards.filter(card => card.reps === 0);
    const masteredCards = flashcards.filter(card => card.easiness >= 2.5 && card.interval >= 30);
    const avgEasiness = totalCards > 0 ? flashcards.reduce((sum, card) => sum + card.easiness, 0) / totalCards : 0;
    
    return { totalCards, dueCards: dueCards.length, newCards: newCards.length, masteredCards: masteredCards.length, avgEasiness };
  };

  const getFilteredCards = () => {
    return flashcards.filter(card => {
      const matchesSearch = card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.tag.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'all' || card.tag === selectedTag;
      
      return matchesSearch && matchesTag;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStudyCards = () => {
    const now = new Date();
    const filtered = getFilteredCards();
    
    switch (studyType) {
      case 'due':
        return filtered.filter(card => new Date(card.due) <= now);
      case 'new':
        return filtered.filter(card => card.reps === 0);
      case 'review':
        return filtered.filter(card => card.reps > 0);
      case 'cram':
        return filtered;
      default:
        return filtered;
    }
  };

  const createCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;

    const card: Flashcard = {
      front: newCard.front,
      back: newCard.back,
      tag: newCard.tag || 'General',
      easiness: 2.5,
      interval: 1,
      due: new Date().toISOString(),
      reps: 0
    };

    dispatch({ type: 'ADD_FLASHCARD', payload: card });
    setNewCard({ front: '', back: '', tag: '' });
    setShowCreateForm(false);
  };

  const editCard = (card: Flashcard) => {
    setEditingCard(card);
    setNewCard({ front: card.front, back: card.back, tag: card.tag });
    setShowCreateForm(true);
  };

  const updateCard = () => {
    if (!editingCard || !newCard.front.trim() || !newCard.back.trim()) return;

    const updatedCard: Flashcard = {
      ...editingCard,
      front: newCard.front,
      back: newCard.back,
      tag: newCard.tag || 'General'
    };

    dispatch({ type: 'UPDATE_FLASHCARD', payload: updatedCard });
    setEditingCard(null);
    setNewCard({ front: '', back: '', tag: '' });
    setShowCreateForm(false);
  };

  const deleteCard = (card: Flashcard) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      dispatch({ type: 'DELETE_FLASHCARD', payload: card.front });
    }
  };

  const duplicateCard = (card: Flashcard) => {
    const duplicatedCard: Flashcard = {
      ...card,
      front: `${card.front} (Copy)`,
      easiness: 2.5,
      interval: 1,
      due: new Date().toISOString(),
      reps: 0
    };
    dispatch({ type: 'ADD_FLASHCARD', payload: duplicatedCard });
  };

  const getDueCards = (): Flashcard[] => {
    const now = new Date();
    return flashcards.filter(card => new Date(card.due) <= now);
  };

  const startStudy = () => {
    const cards = getStudyCards();
    if (cards.length > 0) {
      setStudyCards(cards);
      setCurrentCard(cards[0]);
      setCurrentIndex(0);
      setShowBack(false);
      setStudyMode(true);
      setStudyStartTime(Date.now());
      setStudyTime(0);
      setStudyStats({ correct: 0, incorrect: 0, total: 0 });
      setStreak(0);
    }
  };

  const nextCard = () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentCard(studyCards[currentIndex + 1]);
      setShowBack(false);
    } else {
      // Study session complete
      setStudyMode(false);
      setCurrentCard(null);
      setStudyCards([]);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentCard(studyCards[currentIndex - 1]);
      setShowBack(false);
    }
  };

  const rateCard = (quality: number) => {
    if (currentCard) {
      updateCardSRS(currentCard, quality);
      
      // Update study stats
      const isCorrect = quality >= 3;
      setStudyStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        total: prev.total + 1
      }));

      // Update streak
      if (isCorrect) {
        setStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak > maxStreak) {
            setMaxStreak(newStreak);
            localStorage.setItem('flashcard-max-streak', newStreak.toString());
          }
          return newStreak;
        });
      } else {
        setStreak(0);
      }

      nextCard();
    }
  };

  useEffect(() => {
    // Add some default flashcards if none exist
    if (flashcards.length === 0) {
      const defaultCards: Flashcard[] = [
        {
          front: "What are the four main functions of management?",
          back: "Planning, Organizing, Leading, and Controlling",
          tag: "Management Functions",
          easiness: 2.5,
          interval: 1,
          due: new Date().toISOString(),
          reps: 0
        },
        {
          front: "Define MBO",
          back: "Management by Objectives - a systematic approach where managers and employees jointly set specific, measurable objectives and periodically review progress",
          tag: "Planning",
          easiness: 2.5,
          interval: 1,
          due: new Date().toISOString(),
          reps: 0
        },
        {
          front: "What is delegation?",
          back: "The transfer of authority from a superior to a subordinate to accomplish specific tasks",
          tag: "Organizing",
          easiness: 2.5,
          interval: 1,
          due: new Date().toISOString(),
          reps: 0
        }
      ];

      defaultCards.forEach(card => {
        dispatch({ type: 'ADD_FLASHCARD', payload: card });
      });
    }
  }, [flashcards.length, dispatch]);

  const dueCards = getDueCards();
  const tags = [...new Set(flashcards.map(card => card.tag))];

  if (studyMode && currentCard) {
    const progress = ((currentIndex + 1) / studyCards.length) * 100;
    const accuracy = studyStats.total > 0 ? Math.round((studyStats.correct / studyStats.total) * 100) : 0;

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setStudyMode(false);
                setCurrentCard(null);
                setShowBack(false);
                setStudyCards([]);
              }}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Exit Study
            </button>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(studyTime)}
            </div>
            {streak > 0 && (
              <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                <Flame className="w-4 h-4 mr-1" />
                {streak} streak
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Card {currentIndex + 1} of {studyCards.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {Math.round(progress)}% Complete
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Study Info</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    <Target className="w-4 h-4 mr-2" />
                    Accuracy
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{accuracy}%</p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Correct
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">{studyStats.correct}</p>
                </div>
                
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    <XCircle className="w-4 h-4 mr-2" />
                    Incorrect
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300">{studyStats.incorrect}</p>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 min-h-[500px] flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className="inline-block px-3 py-1 bg-[#4A6FA5]/10 text-[#4A6FA5] rounded-full text-sm font-medium">
                    {currentCard.tag}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Reps: {currentCard.reps} | Ease: {currentCard.easiness.toFixed(1)}
                  </span>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {showBack ? "Answer:" : "Question:"}
                  </h2>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-8 min-h-[200px] flex items-center justify-center shadow-inner">
                    <p className="text-lg text-gray-800 dark:text-gray-200 text-center leading-relaxed">
                      {showBack ? currentCard.back : currentCard.front}
                    </p>
                  </div>
                </div>
              </div>

              {!showBack ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowBack(true)}
                    className="px-8 py-4 bg-[#4A6FA5] text-white rounded-xl hover:bg-[#3d5a8c] transition-colors text-lg font-medium shadow-lg"
                  >
                    Show Answer
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-lg">
                    How well did you know this?
                  </p>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { quality: 1, label: 'Again', color: 'bg-red-500 hover:bg-red-600', icon: '❌' },
                      { quality: 2, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600', icon: '😰' },
                      { quality: 3, label: 'Good', color: 'bg-yellow-500 hover:bg-yellow-600', icon: '😊' },
                      { quality: 4, label: 'Easy', color: 'bg-green-500 hover:bg-green-600', icon: '😎' },
                      { quality: 5, label: 'Perfect', color: 'bg-blue-500 hover:bg-blue-600', icon: '🎉' }
                    ].map(({ quality, label, color, icon }) => (
                      <button
                        key={quality}
                        onClick={() => rateCard(quality)}
                        className={`px-4 py-3 ${color} text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105`}
                      >
                        <div className="text-lg mb-1">{icon}</div>
                        <div>{label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={previousCard}
                  disabled={currentIndex === 0}
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
                
                <button
                  onClick={nextCard}
                  disabled={currentIndex >= studyCards.length - 1}
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getPerformanceStats();
  const filteredCards = getFilteredCards();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <Brain className="w-8 h-8 mr-3 text-[#4A6FA5]" />
          Flashcards
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Study with spaced repetition system for better retention</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCards}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Cards</p>
            </div>
            <Brain className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.dueCards}</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Due Today</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.newCards}</p>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">New Cards</p>
            </div>
            <Star className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.masteredCards}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Mastered</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.avgEasiness.toFixed(1)}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Avg Ease</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Study Modes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Study Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'due', label: 'Due Cards', description: 'Cards due for review', icon: Clock, color: 'text-orange-500', count: stats.dueCards },
            { id: 'new', label: 'New Cards', description: 'Never studied before', icon: Star, color: 'text-green-500', count: stats.newCards },
            { id: 'review', label: 'Review', description: 'Previously studied', icon: RefreshCw, color: 'text-blue-500', count: stats.totalCards - stats.newCards },
            { id: 'cram', label: 'Cram Mode', description: 'Study all cards', icon: Zap, color: 'text-purple-500', count: stats.totalCards }
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  studyType === mode.id
                    ? 'border-[#4A6FA5] bg-[#4A6FA5]/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-[#4A6FA5] hover:bg-[#4A6FA5]/5'
                }`}
                onClick={() => setStudyType(mode.id as any)}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-6 h-6 ${mode.color}`} />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{mode.count}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{mode.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{mode.description}</p>
              </div>
            );
          })}
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
                placeholder="Search flashcards..."
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
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Card
            </button>
            
            <button
              onClick={startStudy}
              disabled={getStudyCards().length === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-2" />
              Study ({getStudyCards().length})
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {tags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Card Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
            </h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditingCard(null);
                setNewCard({ front: '', back: '', tag: '' });
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Front (Question)
              </label>
              <textarea
                value={newCard.front}
                onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
                rows={3}
                placeholder="Enter the question..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Back (Answer)
              </label>
              <textarea
                value={newCard.back}
                onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
                rows={3}
                placeholder="Enter the answer..."
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tag (Category)
            </label>
            <input
              type="text"
              value={newCard.tag}
              onChange={(e) => setNewCard({ ...newCard, tag: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
              placeholder="e.g., Management Functions, Planning, etc."
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={editingCard ? updateCard : createCard}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {editingCard ? 'Update Card' : 'Create Card'}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditingCard(null);
                setNewCard({ front: '', back: '', tag: '' });
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card, index) => {
          const isDue = new Date(card.due) <= new Date();
          const nextReview = new Date(card.due).toLocaleDateString();
          const isMastered = card.easiness >= 2.5 && card.interval >= 30;
          
          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg group ${
                isDue 
                  ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10' 
                  : isMastered
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isDue 
                      ? 'bg-orange-200 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
                      : isMastered
                      ? 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {card.tag}
                  </span>
                  {isMastered && (
                    <Award className="w-4 h-4 text-green-500" />
                  )}
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => editCard(card)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Edit card"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateCard(card)}
                    className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    title="Duplicate card"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCard(card)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {card.front}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {card.back}
                </p>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Reviews: {card.reps}</span>
                  <span>Ease: {card.easiness.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next: {nextReview}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    isDue ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' :
                    isMastered ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {isDue ? 'Due' : isMastered ? 'Mastered' : 'Scheduled'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedTag !== 'all' ? 'No flashcards found' : 'No Flashcards Yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {searchQuery || selectedTag !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first flashcard to start studying with spaced repetition'
            }
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create First Card
            </button>
            {(searchQuery || selectedTag !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('all');
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;