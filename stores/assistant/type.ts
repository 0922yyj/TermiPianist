// 消息类型定义
export interface Message {
  type: string;
  id: string;
  sessionId: string;
  timestamp: string;
  content: string;
  status: number;
}

// 学习数据类型
export interface LearningData {
  filePaths: string[];
  mode: string;
}

// Store 状态类型
export interface AssistantState {
  messages: Message[];
  performLogMessages: Message[];
  learningData?: LearningData;
  currentSessionId?: string | null;
  addMessages: (msg: Message) => void;
  addPerformLogMessage: (msg: Message) => void;
  clearPlayingLogs: () => void;
  setLearningData: (data: LearningData) => void;
}
