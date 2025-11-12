// 键位消息内容类型
export interface KeyPositionContent {
  action: string;
  hand: string;
  key_name: string;
  midi_id: number;
  timestamp: number;
}

// 消息类型定义
export interface Message {
  type: string;
  id: string;
  sessionId: string;
  timestamp: string;
  content: string | KeyPositionContent;
  status: number;
}

// 会话消息组类型
export interface SessionMessages {
  sessionId: string;
  messages: Message[];
}

// 学习数据类型
export interface LearningData {
  filePaths: string[];
  mode: string;
}

// Store 状态类型
export interface AssistantState {
  messages: SessionMessages[];
  performLogMessages: Message[];
  keyPositionMessages: Message[];
  learningData?: LearningData;
  currentSessionId?: string | null;
  addMessages: (msg: Message) => void;
  addPerformLogMessage: (msg: Message) => void;
  addKeyPositionMessage: (msg: Message) => void;
  clearPlayingLogs: () => void;
  clearKeyPositionMessages: () => void;
  clearMessages: () => void;
  setLearningData: (data: LearningData) => void;
}
