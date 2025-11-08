import { create } from 'zustand';
import type { AssistantState, Message } from './type';

export const useAssistantStore = create<AssistantState>((set) => ({
  messages: [
  ],
  // 演奏日志消息，单独存储
  performLogMessages: [
    {
      type: 'playing_log',
      id: 'initial-log',
      sessionId: 'session-1',
      timestamp: new Date().toISOString(),
      content: '这是一条初始的演奏日志消息',
      status: 1,
    },
    {
      type: 'playing_log',
      id: 'initial-log2',
      sessionId: 'session-1',
      timestamp: new Date().toISOString(),
      content: '这是一条初始的演奏日志消息',
      status: 1,
    },
  ],
  // 添加普通消息
  addMessages: (msg: Message) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),
  // 添加演奏日志消息
  addPerformLogMessage: (msg: Message) =>
    set((state) => ({
      performLogMessages: [...state.performLogMessages, msg],
    })),
}));
