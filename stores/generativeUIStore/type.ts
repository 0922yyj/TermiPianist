// 消息类型定义
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string; // 唯一标识
  role: MessageRole; // 角色:用户/助手/系统
  content: string; // 消息内容
  timestamp: number; // 时间戳
  isStreaming?: boolean; // 是否正在流式输出
  error?: string; // 错误信息(如果有)
}

// 单个会话的状态
export interface SessionState {
  messages: Message[]; // 消息列表
  isLoading: boolean; // 加载状态
  error: string | null; // 错误信息
  threadId?: string; // 线程ID
  threadMessages?: any[]; // 原始线程消息
  threadInterrupt?: any; // 线程中断信息
}

// Store 状态类型
export interface GenerativeUIState {
  // 会话级别的状态管理
  sessionStates: Record<string, SessionState>;
  currentSessionId: string | null;

  // 会话管理
  setCurrentSessionId: (sessionId: string | null) => void;
  createSessionState: (sessionId: string) => void;
  getSessionState: (sessionId?: string) => SessionState | null;

  // 消息管理(支持多会话)
  setMessages: (messages: Message[], sessionId?: string) => void;
  addMessage: (message: Message, sessionId?: string) => void;

  // 加载状态管理
  setLoading: (loading: boolean, sessionId?: string) => void;
  setError: (error: string | null, sessionId?: string) => void;

  // 线程信息管理
  setThreadInfo: (
    threadInfo: { threadId?: string; messages?: any[]; interrupt?: any },
    sessionId?: string
  ) => void;
}
