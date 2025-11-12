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
  const [isStreamEnded, setIsStreamEnded] = useState(false);
  const [hasReceivedData, setHasReceivedData] = useState(false);
  const [isVoiceEnded, setIsVoiceEnded] = useState(true);

  /**
   * 发送消息并处理SSE流响应
   * @param filePaths 可选的文件路径数组
   */
  const sendStreamRequest = useCallback(
    (filePaths?: string[]) => {
      if (!currentSessionId || isProcessing) return;

      setIsProcessing(true);
      setHasReceivedData(false); // 重置数据接收状态

      // 准备请求体
      const requestBody = filePaths
        ? { file_paths: filePaths, mode: 'learning' }
        : {};

      // 发送请求并处理SSE流
      // fetch(`/api/chat`, {
      fetch(`http://${process.env.NEXT_PUBLIC_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
                  // 设置加载状态为false
                  setIsProcessing(false);
                  setHasReceivedData(false); // 重置数据接收状态
                  return;
                }

                // 解码数据
                const chunk = decoder.decode(value, { stream: true });
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
                        // 跳过心跳消息（以冒号开头的行）
                        if (cleanedData.startsWith(':')) {
                          return; // 跳过此次循环
                        }

                        const jsonData = JSON.parse(cleanedData);
                        console.log('jsonData: ', jsonData);
                        // 设置已收到数据标志
                        setHasReceivedData(true);

                        // 将接收到的数据添加到消息列表
                        // 对于某些特殊类型（如 voice_end），即使没有 content 也需要处理
                        if (
                          (jsonData.content || jsonData.type === 'voice_end') &&
                          currentSessionId
                        ) {
                          const aiMessage: Message = {
                            type: jsonData.type,
                            id: jsonData.id,
                            sessionId: currentSessionId, // 使用前端的 currentSessionId
                            content: jsonData.content,
                            timestamp: jsonData.timestamp,
                            status: jsonData.status,
                          };

                          // 根据消息类型选择不同的存储方法
                          if (jsonData.type === 'end') {
                            // 如果是结束消息，设置流结束状态
                            setIsStreamEnded(true);
                            setIsProcessing(false);
                            // 添加end到普通消息
                            useAssistantStore.getState().addMessages(aiMessage);
                            // 也添加end到键位数据消息
                            useAssistantStore
                              .getState()
                              .addKeyPositionMessage(aiMessage);
                          } else if (jsonData.type === 'voice_end') {
                            // 如果是语音结束消息，保存到store
                            useAssistantStore.getState().addMessages(aiMessage);
                            // 设置语音结束标识为true
                            setIsVoiceEnded(true);
                          } else if (jsonData.type === 'playing_log') {
                            // 如果是演奏日志消息，使用addPerformLogMessage方法
                            useAssistantStore
                              .getState()
                              .addPerformLogMessage(aiMessage);
                          } else if (jsonData.type === 'key_position') {
                            // 处理键位数据消息，将content从字符串转换为对象
                            try {
                              // 如果content是字符串，尝试解析为JSON对象
                              if (typeof aiMessage.content === 'string') {
                                aiMessage.content = JSON.parse(
                                  aiMessage.content
                                );
                              }
                            } catch (error) {}

                            // 使用addKeyPositionMessage方法
                            useAssistantStore
                              .getState()
                              .addKeyPositionMessage(aiMessage);
                          } else {
                            // 其他类型的消息，使用addMessages方法
                            useAssistantStore.getState().addMessages(aiMessage);
                          }
                        }
                      } catch (error) {}
                    });
                  } else {
                    // 如果不是SSE格式，尝试直接解析整个chunk
                    try {
                      // 检查是否是心跳消息
                      if (chunk.trim().startsWith(':')) {
                        // 继续处理流
                        return processStream();
                      }

                      const jsonData = JSON.parse(chunk);

                      // 设置已收到数据标志
                      setHasReceivedData(true);

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
                    } catch (error) {}
                  }
                } catch (error) {}

                // 继续处理流
                return processStream();
              })
              .catch((error) => {
                // 设置加载状态为false
                setIsProcessing(false);
              });
          }

          // 开始处理流
          return processStream();
        })
        .catch((error) => {
          // 设置加载状态为false
          setIsProcessing(false);
        });
    },
    [currentSessionId, isProcessing]
  );

  return {
    sendStreamRequest,
    isProcessing,
    isStreamEnded,
    setIsStreamEnded,
    hasReceivedData,
    isVoiceEnded,
    setIsVoiceEnded,
  };
};

export default useStream;
