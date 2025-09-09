import React, { useState, useRef, useEffect, useCallback } from 'react';
import API_ENDPOINTS from '../../config/api';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader, 
  Copy, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  Search,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  MoreVertical,
  X,
  Check,
  AlertCircle,
  Star,
  Bookmark,
  Share2,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  Zap,
  Lightbulb,
  Target,
  Award,
  Flame,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Paperclip,
  Smile,
  Code,
  FileText,
  Image,
  Video,
  Link,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Lock,
  Unlock,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Users,
  Building,
  BookOpen
} from 'lucide-react';
import { useTaxTutor } from '../../contexts/BizTutorContext';
import type { ChatMessage } from '../../types/index';

const Chat: React.FC = () => {
  const { chatMessages, addChatMessage, dispatch } = useTaxTutor();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [showActions, setShowActions] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<Record<number, 'liked' | 'disliked' | null>>({});
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<number>>(new Set());
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messageReactions, setMessageReactions] = useState<Record<number, string[]>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [conversationStats, setConversationStats] = useState({
    totalMessages: 0,
    userMessages: 0,
    assistantMessages: 0,
    totalWords: 0,
    averageResponseTime: 0,
    topicsDiscussed: new Set<string>(),
    sessionStart: new Date()
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  // Enhanced analytics functions
  const updateConversationStats = useCallback(() => {
    const stats = {
      totalMessages: chatMessages.length,
      userMessages: chatMessages.filter(msg => msg.role === 'user').length,
      assistantMessages: chatMessages.filter(msg => msg.role === 'assistant').length,
      totalWords: chatMessages.reduce((total, msg) => total + msg.content.split(' ').length, 0),
      averageResponseTime: 0, // This would need timing data
      topicsDiscussed: new Set<string>(),
      sessionStart: conversationStats.sessionStart
    };

    // Extract topics from messages
    chatMessages.forEach(msg => {
      if (msg.role === 'user') {
        const content = msg.content.toLowerCase();
        if (content.includes('planning')) stats.topicsDiscussed.add('Planning');
        if (content.includes('organizing')) stats.topicsDiscussed.add('Organizing');
        if (content.includes('controlling')) stats.topicsDiscussed.add('Controlling');
        if (content.includes('leadership')) stats.topicsDiscussed.add('Leadership');
        if (content.includes('delegation')) stats.topicsDiscussed.add('Delegation');
        if (content.includes('management')) stats.topicsDiscussed.add('Management');
      }
    });

    setConversationStats(stats);
  }, [chatMessages, conversationStats.sessionStart]);

  // Enhanced message actions
  const toggleBookmark = (index: number) => {
    setBookmarkedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const addReaction = (index: number, emoji: string) => {
    setMessageReactions(prev => {
      const current = prev[index] || [];
      if (current.includes(emoji)) {
        return { ...prev, [index]: current.filter(e => e !== emoji) };
      } else {
        return { ...prev, [index]: [...current, emoji] };
      }
    });
    setShowEmojiPicker(null);
  };

  const toggleMessageSelection = (index: number) => {
    if (!isMultiSelect) return;
    
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAllMessages = () => {
    setSelectedMessages(new Set(chatMessages.map((_, index) => index)));
  };

  const clearSelection = () => {
    setSelectedMessages(new Set());
    setIsMultiSelect(false);
  };

  const deleteSelectedMessages = () => {
    const indicesToDelete = Array.from(selectedMessages).sort((a, b) => b - a);
    let newMessages = [...chatMessages];
    indicesToDelete.forEach(index => {
      newMessages.splice(index, 1);
    });
    dispatch({ type: 'LOAD_STATE', payload: { chatMessages: newMessages } });
    clearSelection();
  };

  const exportSelectedMessages = () => {
    const selectedMsgs = Array.from(selectedMessages)
      .sort((a, b) => a - b)
      .map(index => chatMessages[index]);
    
    const data = {
      timestamp: new Date().toISOString(),
      messages: selectedMsgs,
      exportedBy: 'user'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxtutor-selected-messages-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage, adjustTextareaHeight]);

  useEffect(() => {
    updateConversationStats();
  }, [updateConversationStats]);

  // Filter messages based on search query
  const filteredMessages = chatMessages.filter(message => 
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Message actions
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const deleteMessage = (index: number) => {
    const newMessages = chatMessages.filter((_, i) => i !== index);
    dispatch({ type: 'LOAD_STATE', payload: { chatMessages: newMessages } });
    setShowActions(null);
  };

  const editMessage = (index: number, content: string) => {
    setEditingMessage(index);
    setEditText(content);
    setShowActions(null);
  };

  const saveEdit = (index: number) => {
    const newMessages = [...chatMessages];
    newMessages[index] = { ...newMessages[index], content: editText };
    dispatch({ type: 'LOAD_STATE', payload: { chatMessages: newMessages } });
    setEditingMessage(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const exportConversation = () => {
    const data = {
      timestamp: new Date().toISOString(),
      messages: chatMessages
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxtutor-conversation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConversation = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.messages && Array.isArray(data.messages)) {
            dispatch({ type: 'LOAD_STATE', payload: { chatMessages: data.messages } });
          }
        } catch (error) {
          console.error('Error importing conversation:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const clearConversation = () => {
    if (confirm('Are you sure you want to clear the conversation?')) {
      dispatch({ type: 'LOAD_STATE', payload: { chatMessages: [] } });
    }
  };

  const giveFeedback = (index: number, feedback: 'liked' | 'disliked') => {
    setMessageFeedback(prev => ({ ...prev, [index]: feedback }));
  };

  const simulateAssistantResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate context-aware response based on user message
    let response = '';
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('planning')) {
      response = `Planning in Management

Planning is a fundamental management function that involves setting objectives and determining actions to achieve them.

Key Benefits:
• Reduces uncertainty - Provides direction in an unpredictable business environment
• Improves coordination - Aligns different departments and activities
• Sets measurable targets - Creates benchmarks for performance evaluation
• Facilitates control - Establishes standards for monitoring progress

Types of Plans:
1. Strategic Plans - Long-term, organization-wide direction (3-5 years)
2. Tactical Plans - Medium-term departmental plans (1-2 years) 
3. Operational Plans - Short-term daily activities (up to 1 year)
4. Contingency Plans - Alternative plans for unexpected situations

Management by Objectives (MBO):
A systematic approach where managers and employees jointly set specific, measurable objectives and periodically review progress.

Key Takeaways:
• Planning is proactive management that reduces uncertainty
• Different types of plans serve different time horizons and organizational levels
• MBO ensures alignment between individual and organizational goals

Practice Question: A college wants to organize an annual cultural fest. Develop a basic planning framework including objectives, timeline, and key activities.`;
    } else if (lowerMessage.includes('organizing') || lowerMessage.includes('delegation')) {
      response = `Organizing Function in Management

Organizing involves arranging and structuring resources and activities to achieve organizational objectives efficiently.

Core Elements:
• Division of Work - Breaking complex tasks into manageable components
• Authority-Responsibility Relationships - Clear reporting structures
• Coordination Mechanisms - Systems to integrate different activities
• Resource Allocation - Optimal distribution of human, financial, and physical resources

Delegation Process:
Delegation is the transfer of authority from a superior to a subordinate to accomplish specific tasks.

Steps in Delegation:
1. Assignment of Responsibility - Define the task clearly
2. Grant of Authority - Provide necessary power to complete the task
3. Creation of Accountability - Establish performance expectations

Benefits of Delegation:
• Reduces workload for managers
• Develops subordinates by giving them growth opportunities
• Improves efficiency by utilizing specialized skills
• Enables focus on strategic activities

Key Takeaways:
• Organizing creates structure and clarity in operations
• Effective delegation empowers employees while maintaining accountability
• Proper organizing reduces conflicts and improves coordination

Practice Question: You're a department head with a team of 10 people. Design an organizational structure that clearly shows authority relationships and delegation opportunities.`;
    } else if (lowerMessage.includes('control') || lowerMessage.includes('controlling')) {
      response = `Controlling Function in Management

Controlling ensures that actual performance aligns with planned objectives through monitoring, measuring, and corrective action.

Control Process:
1. Setting Standards - Establish benchmarks for performance
2. Measuring Performance - Collect data on actual results
3. Comparing Results - Analyze variance between actual vs. planned
4. Taking Corrective Action - Implement measures to address deviations

Types of Control:
• Preventive Control - Actions taken before problems occur
• Concurrent Control - Real-time monitoring during operations
• Feedback Control - Post-activity analysis and correction

Key Performance Indicators (KPIs):
- Financial metrics (ROI, profit margins)
- Operational metrics (productivity, quality)
- Customer metrics (satisfaction, retention)
- Employee metrics (turnover, engagement)

Control Techniques:
• Budgetary Control - Financial planning and monitoring
• Management by Exception - Focus on significant deviations
• Statistical Quality Control - Data-driven quality assurance
• Management Information Systems - Technology-enabled monitoring

Key Takeaways:
• Control is an ongoing process, not a one-time activity
• Effective control systems provide timely and relevant information
• Corrective action should address root causes, not just symptoms

Practice Question: Design a control system for a small manufacturing company that produces 1000 units daily. Include standards, measurement methods, and corrective actions.`;
    } else if (lowerMessage.includes('leadership') || lowerMessage.includes('motivation')) {
      response = `Leadership and Motivation

Leadership involves influencing and guiding others toward achieving organizational goals, while motivation drives individual and team performance.

Leadership Styles:
• Autocratic - Centralized decision-making, direct supervision
• Democratic - Participative approach, team involvement in decisions
• Laissez-faire - Minimal intervention, high employee autonomy
• Transformational - Inspirational leadership that drives change

Motivation Theories:

Maslow's Hierarchy of Needs:
1. Physiological needs (basic survival)
2. Safety needs (security, stability)
3. Social needs (belonging, relationships)
4. Esteem needs (recognition, status)
5. Self-actualization (personal growth)

Herzberg's Two-Factor Theory:
• Hygiene Factors - Prevent dissatisfaction (salary, work conditions)
• Motivating Factors - Create satisfaction (achievement, recognition)

Leadership Qualities:
• Vision - Clear direction for the future
• Communication - Effective information sharing
• Integrity - Consistent ethical behavior
• Empathy - Understanding team members' perspectives
• Adaptability - Flexibility in changing situations

Key Takeaways:
• Effective leadership adapts style to situation and team needs
• Motivation is both intrinsic (internal drive) and extrinsic (external rewards)
• Understanding individual needs helps leaders motivate more effectively

Practice Question: You notice declining productivity in your team. Using motivation theories, develop a comprehensive plan to re-engage your employees and improve performance.`;
    } else {
      response = `Income Tax

I'm TaxTutor, your AI assistant for Income Tax topics. I can help you understand key concepts in:

Basic Concepts:
• Previous Year and Assessment Year - Understanding tax periods
• Types of Persons - Individual, HUF, Company, Partnership
• Heads of Income - Salary, House Property, Business, Capital Gains, Other Sources
• Taxable Income - Gross income minus deductions and exemptions

Deductions and Exemptions:
• Section 80C - ELSS, PPF, EPF, Life Insurance (up to ₹1.5 lakh)
• Section 80D - Health Insurance premiums and medical expenses
• Section 80G - Donations to charitable organizations
• HRA - House Rent Allowance calculation and exemptions

Tax Rates and Slabs:
• Individual Tax Slabs - Progressive tax rates for different income levels
• HUF Tax Rates - Similar to individual tax structure
• Company Tax Rates - Corporate tax rates and surcharges
• Capital Gains Tax - Short-term and long-term capital gains

Filing and Compliance:
• ITR Forms - Different forms for different types of taxpayers
• TDS - Tax Deducted at Source on various payments
• Advance Tax - Quarterly tax payments for current year
• Refunds and Penalties - Understanding tax refunds and late fees

Special Provisions:
• Agricultural Income - Exemptions and clubbing provisions
• Clubbing of Income - Income of spouse and minor children
• Exemptions - Various income exemptions under different sections
• Tax Planning - Legal strategies to minimize tax liability

Feel free to ask specific questions about any tax topic, and I'll provide structured explanations with examples!

Key Takeaways:
• Income Tax covers all aspects of personal and business taxation
• Understanding deductions helps in effective tax planning
• Real-world tax examples make concepts more applicable

Practice Question: Calculate the tax liability for an individual with gross salary ₹8,00,000, HRA ₹1,20,000 (actual rent ₹1,00,000), and 80C investments ₹1,50,000. Use current tax slabs.`;
    }
    
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response
    };
    
    addChatMessage(assistantMessage);
    setIsTyping(false);
  };

  const handleSendMessage = async (retry = false) => {
    if (!inputMessage.trim() && !retry) return;
    
    if (!retry) {
      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: inputMessage
      };
      
      addChatMessage(userMessage);
      setInputMessage('');
    }
    
    // Stream from backend Groq API (SSE)
    try {
      setIsTyping(true);
      setIsRetrying(retry);
      const controller = new AbortController();
      const res = await fetch(API_ENDPOINTS.CHAT_STREAM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are TaxTutor, an AI-powered interactive tutor specializing in Income Tax. Your role is to teach tax concepts in a way that is concise, exam-focused, and highly engaging.

Role & Personality
- Act like a supportive tax consultant + mentor.
- Be friendly, analytical, and practical.
- Adapt tone to the learner's level (student, professional, business owner).
- Use real-world tax scenarios and practical examples.

Response Style
1. Concise & Clear
   - Keep explanations short but impactful.
   - Use structured formatting: headings, bullet points, calculations when helpful.
   - Prioritize clarity over length.
   - DO NOT use asterisks (*) or markdown formatting in your responses.

2. Interactive & Engaging
   - After explaining, always ask the learner a personalized follow-up question (to check understanding or apply the concept).
   - Encourage participation: "What do you think?", "Can you calculate this?", "How would this affect your tax liability?"
   - Use mini-quizzes, case studies, and tax calculation scenarios.

3. Exam-Oriented
   - Tailor depth to marks:
     - 2 marks → definition or key concept
     - 5 marks → explanation + 2 practical examples
     - 10 marks → comprehensive analysis (provisions, calculations, implications, case studies)
   - Provide model answers with tax reasoning.

4. Learning Reinforcement
   - End each response with:
     (1) Key Tax Concepts — 3–4 bullets summarizing the main idea.
     (2) Practice Question — relevant tax calculation or scenario.

Content Coverage
You must cover the entire Income Tax syllabus, including:
- Basic Concepts: Previous Year, Assessment Year, Person, Income, Taxable Income
- Heads of Income: Salary, House Property, Business/Profession, Capital Gains, Other Sources
- Deductions: Section 80C, 80D, 80G, 80TTA, 80TTB, and other deductions
- Tax Rates: Individual, HUF, Company, Partnership tax rates and slabs
- Filing & Compliance: ITR forms, TDS, Advance Tax, Refunds, Penalties
- Special Provisions: Agricultural Income, Exemptions, Clubbing of Income
- Case Studies: Real tax scenarios, calculation problems, planning strategies

Behavior Rules
- Never overload with long paragraphs.
- Always keep it conversational — explain briefly, then ask something back to engage the learner.
- Use real-world tax examples (salary structures, business scenarios, investment planning) to connect theory with practice.
- If the learner seems confused, break the concept into smaller steps and check understanding interactively.
- Use tax calculations and examples when explaining concepts.
- DO NOT use asterisks, bold markers, or markdown formatting in your responses.
- Use clear headings and bullet points without special formatting characters.

---

Your mission: Teach Income Tax interactively, answer concisely, and keep the learner actively engaged with real-world tax applications.` },
            ...chatMessages,
            ...(retry ? [] : [{ role: 'user', content: inputMessage }]),
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const fallback = await res.json().catch(() => ({} as any));
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: `❌ **Connection Error**\n\nI'm having trouble connecting to the AI service. This could be due to:\n\n• Network connectivity issues\n• Server maintenance\n• High demand\n\n**What you can do:**\n• Check your internet connection\n• Try again in a few moments\n• Contact support if the issue persists\n\n*Error details: ${fallback.error || 'Unknown'}${fallback.details ? ' — ' + fallback.details : ''}*` 
        };
        addChatMessage(assistantMessage);
        setIsTyping(false);
        setIsRetrying(false);
        setRetryCount(prev => prev + 1);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let partial = '';
      let accumulated = '';

      // Optimistically add an empty assistant message; we'll replace it as tokens stream in
      const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
      addChatMessage(assistantMessage);

      const pump = async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          partial += decoder.decode(value, { stream: true });

          // SSE events come as lines separated by \n\n
          const events = partial.split('\n\n');
          partial = events.pop() || '';
          for (const evt of events) {
            if (evt.startsWith('data: ')) {
              try {
                const payload = JSON.parse(evt.replace('data: ', '')) as { token?: string };
                if (payload.token) {
                  accumulated += payload.token;
                  assistantMessage.content = accumulated;
                }
              } catch {}
            }
          }
        }
      };

      await pump();
      setRetryCount(0); // Reset retry count on successful response
    } catch (e) {
      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: `❌ **Unexpected Error**\n\nSomething went wrong while processing your request. This might be due to:\n\n• Network connectivity issues\n• Server overload\n• Temporary service disruption\n\n**What you can do:**\n• Check your internet connection\n• Try again in a few moments\n• Contact support if the issue persists\n\n*Error: ${e instanceof Error ? e.message : 'Unknown error'}*` 
      };
      addChatMessage(assistantMessage);
    } finally {
      setIsTyping(false);
      setIsRetrying(false);
    }
  };

  const retryLastMessage = () => {
    if (chatMessages.length > 0) {
      const lastUserMessage = [...chatMessages].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        setInputMessage(lastUserMessage.content);
        handleSendMessage(true);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowSearch(!showSearch);
            break;
          case 'e':
            e.preventDefault();
            exportConversation();
            break;
          case 'i':
            e.preventDefault();
            fileInputRef.current?.click();
            break;
          case 'l':
            e.preventDefault();
            clearConversation();
            break;
          case 'r':
            e.preventDefault();
            retryLastMessage();
            break;
          case 'a':
            e.preventDefault();
            if (isMultiSelect) {
              selectAllMessages();
            } else {
              setIsMultiSelect(true);
            }
            break;
          case 'b':
            e.preventDefault();
            setShowAnalytics(!showAnalytics);
            break;
          case 'f':
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
            break;
          case 's':
            e.preventDefault();
            setShowSettings(!showSettings);
            break;
          case 'm':
            e.preventDefault();
            setIsMinimized(!isMinimized);
            break;
        }
      }
      
      // Escape key handling
      if (e.key === 'Escape') {
        setShowActions(null);
        setShowEmojiPicker(null);
        setShowQuickActions(false);
        if (isMultiSelect) {
          clearSelection();
        }
        if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, isMultiSelect, showAnalytics, isFullscreen, showSettings, isMinimized]);

  const formatMessage = (content: string) => {
    // Clean up the content by removing asterisks and improving formatting
    let cleanedContent = content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1'); // Remove inline code markers

    const lines = cleanedContent.split('\n');
    return lines.map((line, index) => {
      // Error messages
      if (line.startsWith('❌')) {
        return (
          <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-red-800 dark:text-red-200">
                {formatMessage(line.replace('❌', ''))}
              </div>
            </div>
          </div>
        );
      }
      
      // Main headings (remove ## and ###)
      if (line.startsWith('## ') || line.startsWith('### ')) {
        const isMainHeading = line.startsWith('## ');
        return (
          <h2 key={index} className={`${isMainHeading ? 'text-xl' : 'text-lg'} font-bold text-gray-900 dark:text-white mt-6 mb-3 flex items-center`}>
            <span className={`${isMainHeading ? 'w-2 h-2' : 'w-1.5 h-1.5'} bg-[#4A6FA5] rounded-full mr-3`}></span>
            {line.replace(/^#{1,3}\s*/, '')}
          </h2>
        );
      }
      
      // Bullet points (clean up • and -)
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li key={index} className="text-gray-700 dark:text-gray-300 ml-6 mb-2 flex items-start">
            <span className="text-[#4A6FA5] mr-3 mt-1 text-sm">▶</span>
            <span>{line.replace(/^[•-]\s*/, '')}</span>
          </li>
        );
      }
      
      // Numbered lists
      if (/^\d+\./.test(line)) {
        return (
          <div key={index} className="text-gray-700 dark:text-gray-300 mb-2 ml-6 flex items-start">
            <span className="text-[#4A6FA5] mr-3 mt-1 text-sm font-semibold">
              {line.match(/^\d+/)?.[0]}.
            </span>
            <span>{line.replace(/^\d+\.\s*/, '')}</span>
          </div>
        );
      }
      
      // Key Takeaways section
      if (line.toLowerCase().includes('key takeaways') || line.toLowerCase().includes('key takeaway')) {
        return (
          <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" />
              Key Takeaways
            </h4>
            <div className="text-blue-800 dark:text-blue-300">
              {formatMessage(line.replace(/key takeaways?/gi, '').trim())}
            </div>
          </div>
        );
      }
      
      // Practice Question section
      if (line.toLowerCase().includes('practice question') || line.toLowerCase().includes('practice questions')) {
        return (
          <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Practice Question
            </h4>
            <div className="text-green-800 dark:text-green-300">
              {formatMessage(line.replace(/practice questions?/gi, '').trim())}
            </div>
          </div>
        );
      }
      
      // Benefits section
      if (line.toLowerCase().includes('benefits') || line.toLowerCase().includes('benefit')) {
        return (
          <div key={index} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center">
              <Award className="w-4 h-4 mr-2" />
              Benefits
            </h4>
            <div className="text-purple-800 dark:text-purple-300">
              {formatMessage(line.replace(/benefits?/gi, '').trim())}
            </div>
          </div>
        );
      }
      
      // Types section
      if (line.toLowerCase().includes('types') || line.toLowerCase().includes('type')) {
        return (
          <div key={index} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Types
            </h4>
            <div className="text-orange-800 dark:text-orange-300">
              {formatMessage(line.replace(/types?/gi, '').trim())}
            </div>
          </div>
        );
      }
      
      // Process section
      if (line.toLowerCase().includes('process') || line.toLowerCase().includes('steps')) {
        return (
          <div key={index} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Process
            </h4>
            <div className="text-indigo-800 dark:text-indigo-300">
              {formatMessage(line.replace(/process|steps/gi, '').trim())}
            </div>
          </div>
        );
      }
      
      // Regular paragraphs
      if (line.trim()) {
        return <p key={index} className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{line}</p>;
      }
      return <div key={index} className="mb-2"></div>;
    });
  };

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsFullscreen(false)} />
      )}
      
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'max-w-7xl mx-auto h-[calc(100vh-180px)]'} flex flex-col bg-white dark:bg-gray-900 ${isFullscreen ? 'shadow-2xl' : ''} transition-all duration-300 ease-in-out`}>
      {/* Enhanced Header with Actions */}
      <div className={`mb-6 flex items-center justify-between p-4 bg-gradient-to-r from-[#4A6FA5]/5 to-[#3d5a8c]/5 dark:from-[#4A6FA5]/10 dark:to-[#3d5a8c]/10 ${isFullscreen ? 'rounded-none border-b border-gray-200 dark:border-gray-700' : 'rounded-xl border border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4A6FA5] to-[#3d5a8c] rounded-xl flex items-center justify-center shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
              AI Tutor Chat
              {isFullscreen && (
                <span className="ml-3 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium flex items-center">
                  <Maximize2 className="w-3 h-3 mr-1" />
                  Fullscreen
                </span>
              )}
              {conversationStats.totalMessages > 0 && (
                <span className="ml-3 px-2 py-1 bg-[#4A6FA5]/10 text-[#4A6FA5] rounded-full text-sm font-medium">
                  {conversationStats.totalMessages} messages
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Get instant help with Income Tax concepts</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Quick Actions Toggle */}
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Quick Actions"
          >
            <Zap className="w-4 h-4" />
          </button>
          
          {/* Analytics Toggle */}
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Analytics (Ctrl+B)"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          
          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Search messages (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>
          
          {/* Multi-select Toggle */}
          <button
            onClick={() => setIsMultiSelect(!isMultiSelect)}
            className={`p-2 rounded-lg transition-colors ${
              isMultiSelect 
                ? 'bg-[#4A6FA5] text-white' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Multi-select (Ctrl+A)"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Settings (Ctrl+S)"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Fullscreen (Ctrl+F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          {/* Export */}
          <button
            onClick={exportConversation}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Export conversation (Ctrl+E)"
          >
            <Download className="w-4 h-4" />
          </button>
          
          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Import conversation (Ctrl+I)"
          >
            <Upload className="w-4 h-4" />
          </button>
          
          {/* Clear */}
          <button
            onClick={clearConversation}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
            title="Clear conversation (Ctrl+L)"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
          
          {/* Retry */}
          {retryCount > 0 && (
            <button
              onClick={retryLastMessage}
              className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20 hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors"
              title="Retry last message (Ctrl+R)"
            >
              <RefreshCw className="w-4 h-4 text-orange-600" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Search, label: 'Search', action: () => setShowSearch(true), shortcut: 'Ctrl+K' },
              { icon: BarChart3, label: 'Analytics', action: () => setShowAnalytics(true), shortcut: 'Ctrl+B' },
              { icon: Download, label: 'Export', action: exportConversation, shortcut: 'Ctrl+E' },
              { icon: Settings, label: 'Settings', action: () => setShowSettings(true), shortcut: 'Ctrl+S' },
              { icon: Bookmark, label: 'Bookmarks', action: () => {}, shortcut: 'Ctrl+B' },
              { icon: Share2, label: 'Share', action: () => {}, shortcut: 'Ctrl+Shift+S' },
              { icon: RotateCcw, label: 'Retry', action: retryLastMessage, shortcut: 'Ctrl+R' },
              { icon: Trash2, label: 'Clear', action: clearConversation, shortcut: 'Ctrl+L' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.shortcut}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-[#4A6FA5]" />
            Conversation Analytics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{conversationStats.totalMessages}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Messages</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{conversationStats.userMessages}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Your Messages</div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{conversationStats.assistantMessages}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">AI Responses</div>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{conversationStats.totalWords}</div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Total Words</div>
            </div>
          </div>
          {conversationStats.topicsDiscussed.size > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topics Discussed:</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(conversationStats.topicsDiscussed).map((topic, index) => (
                  <span key={index} className="px-2 py-1 bg-[#4A6FA5]/10 text-[#4A6FA5] rounded-full text-xs font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-select Actions */}
      {isMultiSelect && selectedMessages.size > 0 && (
        <div className="mb-4 p-3 bg-[#4A6FA5]/10 dark:bg-[#4A6FA5]/20 rounded-lg border border-[#4A6FA5]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-[#4A6FA5] dark:text-[#4A6FA5]">
                {selectedMessages.size} message{selectedMessages.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={selectAllMessages}
                className="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Select All
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportSelectedMessages}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              <button
                onClick={deleteSelectedMessages}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Search Bar */}
      {showSearch && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
            />
            <button
              onClick={() => setShowSearch(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <div className={`flex-1 glass ${isFullscreen ? 'rounded-none' : 'rounded-xl'} border border-white/10 flex flex-col overflow-hidden`}>
        {/* Enhanced Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={chatContainerRef}>
          {filteredMessages.length === 0 && chatMessages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#4A6FA5] to-[#3d5a8c] rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Welcome to TaxTutor!</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-8 text-lg">
                I'm your AI tutor for Income Tax. Ask me anything and I'll provide structured explanations with examples and practice questions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {[
                  { text: "Explain Section 80C deductions", icon: Target, color: "from-blue-500 to-blue-600" },
                  { text: "What is HRA calculation?", icon: Users, color: "from-green-500 to-green-600" },
                  { text: "Tax slabs and rates", icon: Building, color: "from-purple-500 to-purple-600" },
                  { text: "Capital gains tax", icon: Award, color: "from-orange-500 to-orange-600" },
                  { text: "TDS and advance tax", icon: BookOpen, color: "from-indigo-500 to-indigo-600" },
                  { text: "Tax planning strategies", icon: BarChart3, color: "from-pink-500 to-pink-600" }
                ].map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setInputMessage(suggestion.text)}
                      className="group px-6 py-4 rounded-xl text-sm transition-all duration-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-[#4A6FA5]/10 hover:to-[#3d5a8c]/10 border border-gray-200 dark:border-gray-600 hover:border-[#4A6FA5]/40 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${suggestion.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{suggestion.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 p-4 bg-gradient-to-r from-[#4A6FA5]/5 to-[#3d5a8c]/5 dark:from-[#4A6FA5]/10 dark:to-[#3d5a8c]/10 rounded-xl border border-[#4A6FA5]/20">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  💡 <strong>Pro tip:</strong> Use keyboard shortcuts for faster navigation
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Ctrl+K: Search</span>
                  <span>Ctrl+E: Export</span>
                  <span>Ctrl+I: Import</span>
                  <span>Ctrl+L: Clear</span>
                  <span>Ctrl+R: Retry</span>
                  <span>Ctrl+A: Multi-select</span>
                  <span>Ctrl+B: Analytics</span>
                  <span className="font-semibold text-[#4A6FA5]">Ctrl+F: Fullscreen</span>
                  <span>Esc: Exit Fullscreen</span>
                </div>
              </div>
            </div>
          )}

          {filteredMessages.length === 0 && chatMessages.length > 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages found</h3>
              <p className="text-gray-600 dark:text-gray-300">Try a different search term</p>
            </div>
          )}
          
          {filteredMessages.map((message, index) => (
            <div
              key={index}
              className={`group flex items-start space-x-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 bg-gradient-to-br from-[#4A6FA5] to-[#3d5a8c] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="flex-1 max-w-3xl">
                <div
                  className={`rounded-2xl p-5 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#4A6FA5] to-[#3d5a8c] text-white ml-12'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {editingMessage === index ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEdit(index)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      {formatMessage(message.content)}
                    </div>
                  )}
                </div>
                
                {/* Message Actions */}
                <div className={`flex items-center space-x-2 mt-2 ${message.role === 'user' ? 'justify-end mr-12' : 'justify-start ml-12'}`}>
                  {message.role === 'assistant' && (
                    <>
                      <button
                        onClick={() => giveFeedback(index, 'liked')}
                        className={`p-1 rounded transition-colors ${
                          messageFeedback[index] === 'liked' 
                            ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                        }`}
                        title="Good response"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => giveFeedback(index, 'disliked')}
                        className={`p-1 rounded transition-colors ${
                          messageFeedback[index] === 'disliked' 
                            ? 'text-red-600 bg-red-100 dark:bg-red-900/20' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
                        }`}
                        title="Poor response"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(showActions === index ? null : index)}
                      className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {showActions === index && (
                      <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </button>
                        {message.role === 'user' && (
                          <button
                            onClick={() => editMessage(index, message.content)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => deleteMessage(index)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4A6FA5] to-[#3d5a8c] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#4A6FA5] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#4A6FA5] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#4A6FA5] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    {isRetrying ? 'Retrying...' : 'TaxTutor is thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`border-t border-white/10 p-4 sticky bottom-0 bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(24,26,36,0.95)] backdrop-blur ${isFullscreen ? 'rounded-none' : 'rounded-b-xl'}`}>
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about tax deductions, HRA, capital gains, or any income tax topic..."
                className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200"
                rows={1}
                disabled={isTyping}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {inputMessage.length > 0 && `${inputMessage.length} characters`}
              </div>
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#4A6FA5] to-[#3d5a8c] hover:from-[#3d5a8c] hover:to-[#2d4a7c] text-white shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div>
              Press Enter to send • Shift+Enter for new line
            </div>
            <div className="flex items-center space-x-4">
              <span>Ctrl+K: Search</span>
              <span>Ctrl+E: Export</span>
              <span>Ctrl+R: Retry</span>
              <span>Ctrl+F: Fullscreen</span>
              <span>Esc: Exit Fullscreen</span>
            </div>
          </div>
        </div>
      </div>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={importConversation}
          className="hidden"
        />
      </div>
    </>
  );
};

export default Chat;