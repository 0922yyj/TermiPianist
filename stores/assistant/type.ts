// 消息类型定义
export interface Message {
  type: string;
  id: string;
  sessionId: string;
  timestamp: string;
  content: string;
  status: number;
}

// Store 状态类型
export interface AssistantState {
  messages: Message[];
  performLogMessages: Message[];
  addMessages: (msg: Message) => void;
  addPerformLogMessage: (msg: Message) => void;
}
