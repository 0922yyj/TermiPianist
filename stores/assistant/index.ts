import { create } from 'zustand';
import type { AssistantState, Message, LearningData } from './type';

export const useAssistantStore = create<AssistantState>((set) => ({
  messages: [],
  // 演奏日志消息，单独存储
  performLogMessages: [],
  // 键位数据消息，单独存储
  keyPositionMessages: [],
  // 当前会话ID
  currentSessionId: 'session-1',
  // 学习数据（包含文件路径和模式）
  learningData: { filePaths: [], mode: '' },
  // 添加普通消息
  addMessages: (msg: Message) =>
    set((state) => {
      // 查找是否已存在该 sessionId 的会话
      const sessionIndex = state.messages.findIndex(
        (session) => session.sessionId === msg.sessionId
      );

      if (sessionIndex !== -1) {
        // 如果会话已存在，添加消息到该会话中
        const updatedMessages = [...state.messages];
        updatedMessages[sessionIndex] = {
          ...updatedMessages[sessionIndex],
          messages: [...updatedMessages[sessionIndex].messages, msg],
        };
        return { messages: updatedMessages };
      } else {
        // 如果会话不存在，创建新的会话
        return {
          messages: [
            ...state.messages,
            {
              sessionId: msg.sessionId,
              messages: [msg],
            },
          ],
        };
      }
    }),
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
  // 添加键位数据消息
  addKeyPositionMessage: (msg: Message) =>
    set((state) => ({
      keyPositionMessages: [...state.keyPositionMessages, msg],
    })),
  // 清空键位数据
  clearKeyPositionMessages: () =>
    set(() => ({
      keyPositionMessages: [],
    })),
}));
