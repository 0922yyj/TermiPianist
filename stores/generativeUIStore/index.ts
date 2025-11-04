import { create } from "zustand";
import type { Message, SessionState, GenerativeUIState } from "./type";

// 重新导出类型定义
export type {
  Message,
  MessageRole,
  SessionState,
  GenerativeUIState,
} from "./type";

export const useGenerativeUIStore = create<GenerativeUIState>((set, get) => ({
  // 初始状态
  sessionStates: {},
  currentSessionId: null,

  // 设置当前会话ID
  setCurrentSessionId: (sessionId: string | null) => {
    set({ currentSessionId: sessionId });
  },

  // 创建新会话
  createSessionState: (sessionId: string) => {
    const initialState: SessionState = {
      messages: [],
      isLoading: false,
      error: null,
      threadId: undefined,
    };

    set((state) => ({
      sessionStates: {
        ...state.sessionStates,
        [sessionId]: initialState,
      },
      currentSessionId: sessionId,
    }));
  },

  // 获取会话状态
  getSessionState: (sessionId?: string) => {
    const targetSessionId = sessionId || get().currentSessionId;
    if (!targetSessionId) return null;
    return get().sessionStates[targetSessionId] || null;
  },

  // 设置消息列表（项目中未用到）
  setMessages: (messages: Message[], sessionId?: string) => {
    const targetSessionId = sessionId || get().currentSessionId;
    if (!targetSessionId) return;

    set((state) => ({
      sessionStates: {
        ...state.sessionStates,
        [targetSessionId]: {
          ...state.sessionStates[targetSessionId],
          messages,
        },
      },
    }));
  },

  // 添加消息（项目中未用到）
  addMessage: (message: Message, sessionId?: string) => {
    const targetSessionId = sessionId || get().currentSessionId;
    if (!targetSessionId) return;

    set((state) => {
      const currentState = state.sessionStates[targetSessionId];
      if (!currentState) return state;

      // 检查消息是否已存在（避免重复）
      const existingMessage = currentState.messages.find(
        (msg) => msg.id === message.id
      );
      if (existingMessage) return state;

      return {
        sessionStates: {
          ...state.sessionStates,
          [targetSessionId]: {
            ...currentState,
            messages: [...currentState.messages, message],
          },
        },
      };
    });
  },

  // 设置加载状态
  setLoading: (loading: boolean, sessionId?: string) => {
    const targetSessionId = sessionId || get().currentSessionId;
    if (!targetSessionId) return;

    set((state) => ({
      sessionStates: {
        ...state.sessionStates,
        [targetSessionId]: {
          ...state.sessionStates[targetSessionId],
          isLoading: loading,
        },
      },
    }));
  },

  // 设置错误信息
  setError: (error: string | null, sessionId?: string) => {
    const targetSessionId = sessionId || get().currentSessionId;
    if (!targetSessionId) return;

    set((state) => ({
      sessionStates: {
        ...state.sessionStates,
        [targetSessionId]: {
          ...state.sessionStates[targetSessionId],
          error,
        },
      },
    }));
  },

  // 设置线程信息
  setThreadInfo: (
    threadInfo: { threadId?: string; messages?: any[]; interrupt?: any },
    sessionId?: string
  ) => {
    const targetSessionId = sessionId || get().currentSessionId;
    if (!targetSessionId) return;

    set((state) => {
      const currentState = state.sessionStates[targetSessionId];
      if (!currentState) return state;

      // 保护机制：如果thread消息为空且当前已有消息，保持现有消息
      const shouldUpdateMessages =
        threadInfo.messages && threadInfo.messages.length > 0;
      const newMessages: any[] = shouldUpdateMessages
        ? threadInfo.messages || []
        : currentState.messages || [];

      return {
        sessionStates: {
          ...state.sessionStates,
          [targetSessionId]: {
            ...currentState,
            threadId: threadInfo.threadId,
            threadMessages: threadInfo.messages,
            threadInterrupt: threadInfo.interrupt,
            // 只有在thread有消息时才更新，否则保持现有消息
            messages: newMessages,
          },
        },
      };
    });
  },
}));
