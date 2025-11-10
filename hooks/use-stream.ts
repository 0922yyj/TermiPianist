'use client';

import { useState, useCallback } from 'react';
import { useAssistantStore } from '@/stores/assistant';
import type { Message } from '@/stores/assistant/type';

/**
 * 处理SSE流请求的自定义Hook
 * @param currentSessionId 当前会话ID
 * @returns 发送消息的函数和处理状态
 */
export const useStream = (currentSessionId: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 发送消息并处理SSE流响应
   */
  const sendStreamRequest = useCallback(() => {
    if (!currentSessionId || isProcessing) return;

    setIsProcessing(true);

    // 发送请求并处理SSE流
    // fetch(`/api/chat`, {
    fetch(`http://${process.env.NEXT_PUBLIC_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
      },
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
                setIsProcessing(false);
                return;
              }

              // 解码数据
              const chunk = decoder.decode(value, { stream: true });
              console.log('接收到数据块:', chunk);

              // 处理返回的数据
              try {
                // 尝试处理不同格式的数据
                if (chunk.includes('data:')) {
                  // 处理SSE格式的数据
                  const dataLines = chunk
                    .split('data:')
                    .filter((line) => line.trim().length > 0);
                  dataLines.forEach((dataLine) => {
                    try {
                      // 清理数据行，确保是有效的JSON
                      const cleanedData = dataLine.trim();
                      const jsonData = JSON.parse(cleanedData);
                      console.log('解析的SSE数据:', jsonData);

                      // 将接收到的数据添加到消息列表
                      if (jsonData.content && currentSessionId) {
                        const aiMessage: Message = {
                          type: jsonData.type,
                          id: jsonData.id,
                          sessionId: jsonData.sessionId,
                          content: jsonData.content,
                          timestamp: jsonData.timestamp,
                          status: jsonData.status,
                        };

                        // 根据消息类型选择不同的存储方法
                        if (jsonData.type === 'playing_log') {
                          // 如果是演奏日志消息，使用addPerformLogMessage方法
                          useAssistantStore
                            .getState()
                            .addPerformLogMessage(aiMessage);
                        } else {
                          // 其他类型的消息，使用addMessages方法
                          useAssistantStore.getState().addMessages(aiMessage);
                        }
                      }
                    } catch (error) {
                      console.error('解析SSE数据出错:', error);
                    }
                  });
                } else {
                  // 如果不是SSE格式，尝试直接解析整个chunk
                  try {
                    const jsonData = JSON.parse(chunk);
                    console.log('解析的JSON数据:', jsonData);

                    if (jsonData.content && currentSessionId) {
                      const aiMessage: Message = {
                        type: 'assistant',
                        id: Math.random().toString(36).slice(2),
                        sessionId: currentSessionId,
                        content: jsonData.content,
                        timestamp: new Date().toISOString(),
                        status: 1,
                      };
                      useAssistantStore.getState().addMessages(aiMessage);
                    }
                  } catch (error) {
                    console.error('解析JSON数据出错:', error);
                  }
                }
              } catch (error) {
                console.error('处理数据块出错:', error);
              }

              // 继续处理流
              return processStream();
            })
            .catch((error) => {
              console.error('读取流出错:', error);
              // 设置加载状态为false
              setIsProcessing(false);
            });
        }

        // 开始处理流
        return processStream();
      })
      .catch((error) => {
        console.error('请求错误:', error);
        // 设置加载状态为false
        setIsProcessing(false);
      });
  }, [currentSessionId, isProcessing]);

  return {
    sendStreamRequest,
    isProcessing,
  };
};

export default useStream;
