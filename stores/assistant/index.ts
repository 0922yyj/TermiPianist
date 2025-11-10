import { create } from 'zustand';
import type { AssistantState, Message, LearningData } from './type';

export const useAssistantStore = create<AssistantState>((set) => ({
  messages: [],
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
  // 当前会话ID
  currentSessionId: 'session-1',
  // 学习数据（包含文件路径和模式）
  learningData: { filePaths: [], mode: '' },
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
  // 清空演奏日志
  clearPlayingLogs: () =>
    set(() => ({
      performLogMessages: [],
    })),
  // 设置学习数据
  setLearningData: (data: LearningData) =>
    set(() => ({
      learningData: data,
    })),
}));
