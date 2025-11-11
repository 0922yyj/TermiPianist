'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useAssistantStore } from '@/stores/assistant';
import { v4 as uuidv4 } from 'uuid';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import MessageComponent from './message';
import useStream from '@/hooks/use-stream';
import type { Message } from '@/stores/assistant/type';

interface AssistantPanelProps {
  onClose?: () => void;
  isCloseBtn?: boolean;
}

const PerformPanel = ({}: AssistantPanelProps) => {
  const messageListRef = useRef<HTMLDivElement>(null);
  const [isMicActive, setIsMicActive] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 从 assistant store 获取消息
  const chatMessages = useAssistantStore((state) => state.messages);

  // 处理消息列表，合并连续的planning类型消息
  const processedMessages = useMemo(() => {
    const result: (
      | Message
      | {
          type: string;
          id: string;
          content: string;
          planningMessages: Message[];
        }
    )[] = [];
    let planningGroup: Message[] = [];

    chatMessages.forEach((message) => {
      // 跳过type为playing_log的消息
      if (message.type === 'playing_log') {
        return; // 不处理这种类型的消息
      }

      if (message.type === 'planning') {
        // 收集planning类型消息
        planningGroup.push(message);
      } else {
        // 如果有收集到的planning消息，先添加到结果中
        if (planningGroup.length > 0) {
          result.push({
            type: 'planning-group',
            id: `planning-group-${planningGroup[0].id}`,
            content: planningGroup.map((msg) => msg.content).join('\n'),
            planningMessages: planningGroup,
          });
          planningGroup = [];
        }
        // 添加非planning类型的消息
        result.push(message);
      }
    });

    // 处理最后可能剩余的planning消息
    if (planningGroup.length > 0) {
      result.push({
        type: 'planning-group',
        id: `planning-group-${planningGroup[0].id}`,
        content: planningGroup.map((msg) => msg.content).join('\n'),
        planningMessages: planningGroup,
      });
    }

    return result;
  }, [chatMessages]);
  // 初始化会话 - 使用标准 UUID 格式
  useEffect(() => {
    if (!currentSessionId) {
      const sessionId = uuidv4();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentSessionId(sessionId);
    }
  }, [currentSessionId]);

  // 自动滚动到底部
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatMessages, isLoading]);

  // 使用自定义hook处理SSE流
  const {
    sendStreamRequest,
    isStreamEnded,
    setIsStreamEnded,
    hasReceivedData,
  } = useStream(currentSessionId);

  // 监听流结束事件，更新loading状态
  useEffect(() => {
    let isMounted = true;
    if (isStreamEnded && isMounted) {
      // 使用setTimeout避免在effect中直接调用setState
      setTimeout(() => {
        if (isMounted) {
          setIsLoading(false);
          setIsStreamEnded(false); // 重置流结束状态
        }
      }, 0);
    }
    return () => {
      isMounted = false;
    };
  }, [isStreamEnded, setIsStreamEnded]);

  // 处理消息发送
  const handleSend = () => {
    if (isLoading) return;
    setIsLoading(true);
    sendStreamRequest();
  };

  // 处理麦克风按钮点击
  const handleMicClick = () => {
    setIsMicActive(!isMicActive);

    // 如果从非激活状态变为激活状态，则发送请求
    if (!isMicActive) {
      // 清空上次的演奏日志
      const clearPlayingLogs = useAssistantStore.getState().clearPlayingLogs;
      clearPlayingLogs();

      // 直接调用handleSend，不传递参数
      handleSend();
    }
  };
  return (
    <div className="flex h-full flex-col w-full text-black">
      {/* 头部 */}
      <div className="flex flex-col items-center justify-center pb-4 space-y-2 border-b border-dashed border-gray-500">
        <h3 className="text-md font-semibold">Powered by Termitech</h3>
        <div className="text-sm text-gray-700">演奏模式</div>
        {/* 语音输入按钮 */}
        <button
          onClick={handleMicClick}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full transition-colors mt-2 cursor-pointer',
            isMicActive
              ? 'bg-[#3C89E8] hover:bg-[#3C89E8]/90 text-white'
              : 'bg-[#7BB6EA] hover:bg-[#7BB6EA]/90 text-white'
          )}
          aria-label="语音输入"
        >
          {isMicActive ? (
            <div className="relative">
              {/* 语音波浪动画 */}
              <div className="flex items-center justify-center gap-0.5">
                <div className="w-0.5 h-3 bg-white animate-sound-wave-1"></div>
                <div className="w-0.5 h-4 bg-white animate-sound-wave-2"></div>
                <div className="w-0.5 h-5 bg-white animate-sound-wave-3"></div>
                <div className="w-0.5 h-4 bg-white animate-sound-wave-2"></div>
                <div className="w-0.5 h-3 bg-white animate-sound-wave-1"></div>
              </div>
            </div>
          ) : (
            <Mic size={18} />
          )}
        </button>
      </div>

      {/* 消息列表 */}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto py-4 space-y-4"
      >
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-700">
            <p className="text-base">你好！</p>
            <p className="mt-2 text-base">请说出你想听的曲目名称</p>
          </div>
        ) : (
          processedMessages.map((message) => {
            if (message.type === 'planning-group') {
              // 渲染合并后的planning消息组
              return (
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-yellow-50 text-gray-900 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <svg
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      <span className="text-sm font-medium text-yellow-700">
                        大模型思考过程 ：
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap wrap-break-word">
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            } else {
              // 渲染普通消息
              return <MessageComponent key={message.id} message={message} />;
            }
          })
        )}

        {/* 加载状态 - 仅在收到数据后显示 */}
        {isLoading && hasReceivedData && (
          <div className="flex justify-start">
            <div className="flex items-center text-sm text-gray-600">
              <span className="flex items-center">
                <span className="typing-dots ml-1">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              </span>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {/* {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-600 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          </div>
        )} */}
      </div>

      {/* 输入框 */}
      {/* <div className="pt-3">
        <TextInput
          onSend={handleSend}
          disabled={isLoading}
          placeholder="请输入消息..."
          maxLength={MAX_CHAR_LIMIT}
        />
      </div> */}
    </div>
  );
};

export default PerformPanel;
