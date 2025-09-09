import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Target, 
  Key, 
  CheckCircle, 
  Search, 
  Filter, 
  Clock, 
  Star, 
  Play, 
  ArrowLeft, 
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Trophy,
  Award,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTaxTutor } from '../../contexts/BizTutorContext';
import type { Lesson } from '../../types/index';

const Learn: React.FC = () => {
  const { lessons, progress, addAttemptLog } = useTaxTutor();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedLessons, setBookmarkedLessons] = useState<Set<number>>(new Set());
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Timer effect
  useEffect(() => {
    if (startTime && selectedLesson) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, selectedLesson]);

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookmarked-lessons');
    if (saved) {
      setBookmarkedLessons(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarked-lessons', JSON.stringify([...bookmarkedLessons]));
  }, [bookmarkedLessons]);

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    setQuizAnswers({ ...quizAnswers, [questionIndex]: answer });
  };

  const submitQuiz = () => {
    if (!selectedLesson) return;
    
    let correct = 0;
    const total = selectedLesson.exitQuiz.length;
    
    selectedLesson.exitQuiz.forEach((question, index) => {
      if (quizAnswers[index] === question.answer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / total) * 100);
    setQuizScore(score);
    setShowResults(true);
    
    // Log the attempt
    addAttemptLog({
      ts: new Date().toISOString(),
      topic: selectedLesson.topic,
      score: correct,
      total: total,
      elapsedSec: timeSpent,
      answers: selectedLesson.exitQuiz.map((q, i) => ({
        q: q.q,
        type: q.type,
        your: quizAnswers[i] || '',
        correct: quizAnswers[i] === q.answer
      }))
    });
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowResults(false);
    setQuizScore(0);
    setTimeSpent(0);
    setStartTime(new Date());
  };

  const toggleBookmark = (lessonIndex: number) => {
    const newBookmarks = new Set(bookmarkedLessons);
    if (newBookmarks.has(lessonIndex)) {
      newBookmarks.delete(lessonIndex);
    } else {
      newBookmarks.add(lessonIndex);
    }
    setBookmarkedLessons(newBookmarks);
  };

  const isLessonCompleted = (lessonIndex: number) => {
    const lesson = lessons[lessonIndex];
    return progress[lesson.topic] && progress[lesson.topic].attempts > 0;
  };

  const getLessonProgress = (lessonIndex: number) => {
    const lesson = lessons[lessonIndex];
    if (!progress[lesson.topic]) return 0;
    return Math.round((progress[lesson.topic].correct / progress[lesson.topic].attempts) * 100);
  };

  const filteredLessons = lessons.filter((lesson, index) => {
    const matchesSearch = lesson.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.objectives.some(obj => obj.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         lesson.keyTerms.some(term => term.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'completed' && isLessonCompleted(index)) ||
                         (selectedFilter === 'incomplete' && !isLessonCompleted(index));
    
    return matchesSearch && matchesFilter;
  });

  const startLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentContentIndex(0);
    setStartTime(new Date());
    setTimeSpent(0);
    setQuizAnswers({});
    setShowResults(false);
  };

  const nextContent = () => {
    if (selectedLesson && currentContentIndex < selectedLesson.contentBlocks.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    }
  };

  const prevContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    }
  };

  if (selectedLesson) {
    const currentBlock = selectedLesson.contentBlocks[currentContentIndex];
    const progressPercentage = ((currentContentIndex + 1) / selectedLesson.contentBlocks.length) * 100;
    
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedLesson(null)}
            className="flex items-center px-4 py-2 text-[#4A6FA5] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-1" />
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {currentContentIndex + 1} of {selectedLesson.contentBlocks.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#4A6FA5] to-[#3d5a8c] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 sticky top-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Lesson Outline</h3>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center text-sm font-medium text-blue-800 dark:text-blue-200">
                    <Target className="w-4 h-4 mr-2" />
                    Objectives
                  </div>
                </div>
                {selectedLesson.contentBlocks.map((block, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      index === currentContentIndex 
                        ? 'bg-[#4A6FA5] text-white' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setCurrentContentIndex(index)}
                  >
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        index === currentContentIndex ? 'bg-white' : 'bg-[#4A6FA5]'
                      }`}></div>
                      {block.type === 'text' ? 'Text Content' : 
                       block.type === 'bullets' ? 'Key Points' : 'Example'}
                    </div>
                  </div>
                ))}
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                    <Key className="w-4 h-4 mr-2" />
                    Key Terms
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <div className="flex items-center text-sm font-medium text-orange-800 dark:text-orange-200">
                    <Trophy className="w-4 h-4 mr-2" />
                    Exit Quiz
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{selectedLesson.topic}</h1>

              {/* Learning Objectives */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-[#4A6FA5]" />
                  Learning Objectives
                </h2>
                <ul className="space-y-2">
                  {selectedLesson.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Content Navigation */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Content</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevContent}
                      disabled={currentContentIndex === 0}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {currentContentIndex + 1} / {selectedLesson.contentBlocks.length}
                    </span>
                    <button
                      onClick={nextContent}
                      disabled={currentContentIndex === selectedLesson.contentBlocks.length - 1}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Current Content Block */}
                <div className="prose dark:prose-invert max-w-none">
                  {currentBlock.type === 'text' && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{currentBlock.value}</p>
                  )}
                  {currentBlock.type === 'bullets' && Array.isArray(currentBlock.value) && (
                    <ul className="space-y-3 ml-4">
                      {currentBlock.value.map((item, bulletIndex) => (
                        <li key={bulletIndex} className="text-gray-700 dark:text-gray-300 flex items-start text-lg">
                          <span className="w-2 h-2 bg-[#4A6FA5] rounded-full mt-3 mr-4 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {currentBlock.type === 'example' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-[#4A6FA5] p-6 rounded-r-lg">
                      <p className="text-blue-800 dark:text-blue-200 font-medium text-lg mb-2">Example:</p>
                      <p className="text-blue-700 dark:text-blue-300 text-lg">{currentBlock.value}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Terms */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Key className="w-5 h-5 mr-2 text-[#4A6FA5]" />
                  Key Terms
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selectedLesson.keyTerms.map((term, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#4A6FA5]/10 text-[#4A6FA5] rounded-full text-sm font-medium"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Exit Quiz */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-[#4A6FA5]" />
                  Exit Quiz
                </h2>
                
                {showResults && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quiz Complete!</h3>
                        <p className="text-gray-600 dark:text-gray-300">Your score: {quizScore}%</p>
                      </div>
                      <div className="text-3xl font-bold text-[#4A6FA5]">{quizScore}%</div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {selectedLesson.exitQuiz.map((question, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <p className="font-medium text-gray-900 dark:text-white mb-4">
                        {index + 1}. {question.q}
                      </p>
                      
                      {question.type === 'mcq' && question.options && (
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = quizAnswers[index] === option;
                            const isCorrect = option === question.answer;
                            const showAnswer = showResults;
                            
                            return (
                              <label key={optionIndex} className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${
                                showAnswer && isCorrect 
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                  : showAnswer && isSelected && !isCorrect
                                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                  : isSelected
                                  ? 'border-[#4A6FA5] bg-[#4A6FA5]/10'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-[#4A6FA5]'
                              }`}>
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={option}
                                  onChange={() => handleQuizAnswer(index, option)}
                                  className="mr-3 text-[#4A6FA5] focus:ring-[#4A6FA5]"
                                  disabled={showResults}
                                />
                                <span className={`${
                                  showAnswer && isCorrect 
                                    ? 'text-green-800 dark:text-green-200 font-medium' 
                                    : showAnswer && isSelected && !isCorrect
                                    ? 'text-red-800 dark:text-red-200'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {option}
                                </span>
                                {showAnswer && isCorrect && (
                                  <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {question.type === 'short' && (
                        <textarea
                          placeholder="Enter your answer..."
                          value={quizAnswers[index] || ''}
                          onChange={(e) => handleQuizAnswer(index, e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
                          rows={3}
                          disabled={showResults}
                        />
                      )}

                      {showResults && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-green-800 dark:text-green-200 font-medium">Correct Answer:</p>
                          <p className="text-green-700 dark:text-green-300">{question.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  {!showResults ? (
                    <button
                      onClick={submitQuiz}
                      className="px-6 py-3 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors flex items-center"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={resetQuiz}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Try Again
                      </button>
                      <button
                        onClick={() => setSelectedLesson(null)}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Back to Lessons
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-[#4A6FA5]" />
          Learn
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Explore structured lessons on Income Tax</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search lessons, objectives, or key terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </button>
              
              {showFilters && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <label className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="radio"
                        name="filter"
                        value="all"
                        checked={selectedFilter === 'all'}
                        onChange={(e) => setSelectedFilter(e.target.value as any)}
                        className="mr-3"
                      />
                      All Lessons
                    </label>
                    <label className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="radio"
                        name="filter"
                        value="completed"
                        checked={selectedFilter === 'completed'}
                        onChange={(e) => setSelectedFilter(e.target.value as any)}
                        className="mr-3"
                      />
                      Completed
                    </label>
                    <label className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="radio"
                        name="filter"
                        value="incomplete"
                        checked={selectedFilter === 'incomplete'}
                        onChange={(e) => setSelectedFilter(e.target.value as any)}
                        className="mr-3"
                      />
                      Not Started
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300">
          {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson, index) => {
          const originalIndex = lessons.findIndex(l => l.topic === lesson.topic);
          const isCompleted = isLessonCompleted(originalIndex);
          const progress = getLessonProgress(originalIndex);
          const isBookmarked = bookmarkedLessons.has(originalIndex);
          
          return (
            <div
              key={originalIndex}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group relative"
              onClick={() => startLesson(lesson)}
            >
              {/* Bookmark Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(originalIndex);
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-[#4A6FA5]" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-400 hover:text-[#4A6FA5]" />
                )}
              </button>

              {/* Completion Badge */}
              {isCompleted && (
                <div className="absolute top-4 left-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <BookOpen className="w-8 h-8 text-[#4A6FA5] group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {lesson.exitQuiz.length} Questions
                  </span>
                  {isCompleted && (
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                      {progress}% Complete
                    </span>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-[#4A6FA5] transition-colors">
                {lesson.topic}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Learning Objectives:</p>
                <ul className="space-y-1">
                  {lesson.objectives.slice(0, 2).map((objective, objIndex) => (
                    <li key={objIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                      <span className="w-1.5 h-1.5 bg-[#4A6FA5] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {objective}
                    </li>
                  ))}
                  {lesson.objectives.length > 2 && (
                    <li className="text-sm text-gray-500 dark:text-gray-400">
                      +{lesson.objectives.length - 2} more objectives
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {lesson.keyTerms.slice(0, 3).map((term, termIndex) => (
                    <span
                      key={termIndex}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                    >
                      {term}
                    </span>
                  ))}
                  {lesson.keyTerms.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{lesson.keyTerms.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  ~15 min
                </div>
              </div>

              {/* Progress Bar for Completed Lessons */}
              {isCompleted && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No lessons found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try adjusting your search terms or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
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

export default Learn;