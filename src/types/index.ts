export interface Lesson {
  topic: string;
  objectives: string[];
  contentBlocks: ContentBlock[];
  keyTerms: string[];
  exitQuiz: Question[];
}

export interface ContentBlock {
  type: 'text' | 'bullets' | 'example';
  value: string | string[];
}

export interface Question {
  type: 'mcq' | 'short' | 'long';
  q: string;
  options?: string[];
  answer: string;
  rubric?: string[];
  bloom?: 'Remember' | 'Understand' | 'Apply' | 'Evaluate';
}

export interface CaseScenario {
  id: string;
  title: string;
  scenario: string;
  nodes: CaseNode[];
  explain: string;
}

export interface CaseNode {
  prompt: string;
  options: CaseOption[];
}

export interface CaseOption {
  label: string;
  impact: string;
  score: number;
}

export interface Flashcard {
  front: string;
  back: string;
  tag: string;
  easiness: number;
  interval: number;
  due: string;
  reps: number;
}

export interface AttemptLog {
  ts: string;
  topic: string;
  score: number;
  total: number;
  elapsedSec: number;
  answers: AttemptAnswer[];
}

export interface AttemptAnswer {
  q: string;
  type: string;
  your: string;
  correct: boolean;
}

export interface ProgressByTopic {
  attempts: number;
  correct: number;
  timeSec: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}