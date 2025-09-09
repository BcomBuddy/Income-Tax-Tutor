import React, { useState } from 'react';
import { Settings, BookOpen, HelpCircle, Briefcase, Plus, Edit, Trash2 } from 'lucide-react';
import { useTaxTutor } from '../../contexts/BizTutorContext';
import type { Lesson, Question, CaseScenario } from '../../types/index';

const Admin: React.FC = () => {
  const { lessons, questions, cases, dispatch } = useTaxTutor();
  const [activeTab, setActiveTab] = useState<'lessons' | 'questions' | 'cases' | 'settings'>('lessons');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const adminTabs = [
    { id: 'lessons', label: 'Lessons', icon: BookOpen, count: lessons.length },
    { id: 'questions', label: 'Questions', icon: HelpCircle, count: questions.length },
    { id: 'cases', label: 'Cases', icon: Briefcase, count: cases.length },
    { id: 'settings', label: 'Settings', icon: Settings, count: 0 }
  ];

  const renderLessonForm = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {editingItem ? 'Edit Lesson' : 'Create New Lesson'}
      </h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Topic
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
            placeholder="Enter lesson topic"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Learning Objectives (one per line)
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
            rows={4}
            placeholder="Enter learning objectives, one per line"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Key Terms (comma separated)
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
            placeholder="Term1, Term2, Term3"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
          >
            {editingItem ? 'Update' : 'Create'} Lesson
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderQuestionForm = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {editingItem ? 'Edit Question' : 'Create New Question'}
      </h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Type
          </label>
          <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent">
            <option value="mcq">Multiple Choice</option>
            <option value="short">Short Answer</option>
            <option value="long">Long Answer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
            rows={3}
            placeholder="Enter the question"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Options (for MCQ, one per line)
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
            rows={4}
            placeholder="Option 1\nOption 2\nOption 3\nOption 4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Correct Answer
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
            placeholder="Enter the correct answer"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
          >
            {editingItem ? 'Update' : 'Create'} Question
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderContent = () => {
    if (showForm) {
      if (activeTab === 'lessons') return renderLessonForm();
      if (activeTab === 'questions') return renderQuestionForm();
    }

    switch (activeTab) {
      case 'lessons':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Lessons</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-4 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </button>
            </div>
            
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {lesson.topic}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {lesson.objectives.length} objectives • {lesson.keyTerms.length} key terms • {lesson.exitQuiz.length} quiz questions
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {lesson.keyTerms.slice(0, 5).map((term, termIndex) => (
                          <span
                            key={termIndex}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                          >
                            {term}
                          </span>
                        ))}
                        {lesson.keyTerms.length > 5 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{lesson.keyTerms.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingItem(lesson);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'questions':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Questions</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-4 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </button>
            </div>
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-[#4A6FA5]/10 text-[#4A6FA5] rounded text-xs font-medium">
                          {question.type.toUpperCase()}
                        </span>
                        {question.bloom && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            {question.bloom}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {question.q}
                      </h3>
                      {question.options && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          Options: {question.options.join(' | ')}
                        </div>
                      )}
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Answer: {question.answer}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingItem(question);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cases':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Case Studies</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-4 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3d5a8c] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Case
              </button>
            </div>
            
            <div className="space-y-4">
              {cases.map((caseStudy, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {caseStudy.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {caseStudy.scenario}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {caseStudy.nodes.length} decision point{caseStudy.nodes.length !== 1 ? 's' : ''} • 
                        {' '}{caseStudy.nodes.reduce((sum, node) => sum + node.options.length, 0)} total options
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingItem(caseStudy);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">System Settings</h2>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      AI Model
                    </label>
                    <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent">
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      System Persona
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
                      rows={4}
                      defaultValue="You are TaxTutor, an expert Income Tax tutor. Use clear steps, short paragraphs, everyday examples, and simple calculations when helpful. Structure with headings and bullet points. End every response with: (1) Key tax concepts, (2) One practice question."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Auto-generate practice questions</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Automatically create questions from lesson content</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#4A6FA5] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Enable AI grading</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Use AI to grade long-form answers</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#4A6FA5] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
                <div className="flex gap-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Export All Data
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Import Data
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Reset All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage content, configure AI settings, and monitor system</p>
      </div>

      {/* Admin Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 overflow-x-auto">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setShowForm(false);
                  setEditingItem(null);
                }}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#4A6FA5] bg-[#4A6FA5]/10 border border-[#4A6FA5]'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;