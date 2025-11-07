'use client';

import { useState, useCallback } from 'react';
import { useGenerativeUIStore } from '@/stores/generativeUIStore';

/**
 * 处理SSE流请求的自定义Hook
 * @returns 发送消息的函数
 */
export const useStream = (currentSessionId: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // 从store获取状态更新方法
  const addMessage = useGenerativeUIStore((state) => state.addMessage);
  const setLoading = useGenerativeUIStore((state) => state.setLoading);

  /**
   * 发送消息并处理SSE流响应
   * @param text 用户输入的消息文本
   */
  const sendMessage = useCallback(
    (text: string) => {
      if (!currentSessionId || isProcessing) return;

      // 创建用户消息对象
      const message = {
        id: Math.random().toString(36).slice(2),
        role: 'user' as const,
        content: text,
        timestamp: Date.now(),
      };

      // 添加用户消息到store
      addMessage(message, currentSessionId);
      setLoading(true, currentSessionId);
      setIsProcessing(true);

      // 发送请求并处理SSE流
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
          }

          // 检查响应体是否存在
          if (!response.body) {
            throw new Error('响应体为空');
          }

          // 获取响应流的reader
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          // 递归函数来处理流数据
          function processStream(): Promise<void> {
            return reader
              .read()
              .then(({ done, value }) => {
                // 如果流结束了
                if (done) {
                  console.log('流结束');
                  // 设置加载状态为false
                  if (currentSessionId) {
                    setLoading(false, currentSessionId);
                    setIsProcessing(false);
                  }
                  return;
                }

                // 解码数据
                const chunk = decoder.decode(value, { stream: true });
                console.log('接收到数据块:', chunk);

                // 处理SSE格式的数据
                const lines = chunk.split('\n\n');
                lines.forEach((line) => {
                  if (line.startsWith('data:')) {
                    try {
                      const jsonData = JSON.parse(line.substring(5).trim());
                      console.log('解析的SSE数据:', jsonData);

                      // 将接收到的数据添加到消息列表
                      if (jsonData.content && currentSessionId) {
                        const aiMessage = {
                          id: Math.random().toString(36).slice(2),
                          role: 'assistant' as const,
                          content: jsonData.content,
                          timestamp: Date.now(),
                        };
                        addMessage(aiMessage, currentSessionId);
                      }
                    } catch (error) {
                      console.error('解析SSE数据出错:', error);
                    }
                  }
                });

                // 继续处理流
                return processStream();
              })
              .catch((error) => {
                console.error('读取流出错:', error);
                // 设置加载状态为false
                if (currentSessionId) {
                  setLoading(false, currentSessionId);
                  setIsProcessing(false);
                }
              });
          }

          // 开始处理流
          return processStream();
        })
        .catch((error) => {
          console.error('请求错误:', error);
          // 设置加载状态为false
          if (currentSessionId) {
            setLoading(false, currentSessionId);
            setIsProcessing(false);
          }
        });
    },
    [currentSessionId, addMessage, setLoading, isProcessing]
  );

  return {
    sendMessage,
    isProcessing,
  };
};
