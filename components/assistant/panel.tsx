'use client';

import { useRef, useEffect } from 'react';
import { useGenerativeUIStore } from '@/stores/generativeUIStore';
import TextInput from '@/components/text-input';
import { v4 as uuidv4 } from 'uuid';
import { usePathname } from 'next/navigation';
import { useStream } from '@/hooks/useStream';
import { emit } from '@/hooks/user-emitter';

interface AssistantPanelProps {
  onClose?: () => void;
  isCloseBtn?: boolean;
}

const MAX_CHAR_LIMIT = 1000;

const AssistantPanel = ({}: AssistantPanelProps) => {
  const messageListRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentMode = pathname === '/learn' ? 'learn' : 'perform';

  // 从 store 获取状态
  const currentSessionId = useGenerativeUIStore(
    (state) => state.currentSessionId
  );
  const getSessionState = useGenerativeUIStore(
    (state) => state.getSessionState
  );
  const createSessionState = useGenerativeUIStore(
    (state) => state.createSessionState
  );
  const setCurrentSessionId = useGenerativeUIStore(
    (state) => state.setCurrentSessionId
  );
  // const setLoading = useGenerativeUIStore((state) => state.setLoading);
  // const setError = useGenerativeUIStore((state) => state.setError);

  // 获取当前会话状态
  const generativeUIState = getSessionState(currentSessionId || undefined);

  // 解构会话状态
  const { messages: chatMessages = [], isLoading = false } =
    generativeUIState || {};
  console.log('chatMessages', chatMessages);
  // 初始化会话 - 使用标准 UUID 格式
  useEffect(() => {
    if (!currentSessionId) {
      const sessionId = uuidv4();
      createSessionState(sessionId);
      setCurrentSessionId(sessionId);
    }
  }, [currentSessionId, createSessionState, setCurrentSessionId]);

  // 自动滚动到底部
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatMessages, isLoading]);

  // 使用自定义的useStream hook处理SSE流
  const { sendMessage } = useStream(currentSessionId);

  const handleSend = (text: string) => {
    // 直接使用hook中封装的sendMessage方法
    sendMessage(text);
  };
  return (
    <div className="flex h-full flex-col w-full text-black">
      {/* 头部 */}
      <div className="flex flex-col items-center justify-center pb-4 space-y-2 border-b border-dashed border-gray-500">
        <h3 className="text-md font-semibold">Powered by Termitech</h3>
        <div className="text-sm text-gray-700">
          {currentMode === 'learn' ? '学习模式' : '演奏模式'}
        </div>
      </div>

      {/* 消息列表 */}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto py-4 space-y-4"
      >
        {chatMessages.length === 0 ? (
          currentMode === 'learn' ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-700">
              <p className="text-base">请演奏一段30s以内的曲目，供机器人学习</p>
              <div className="flex flex-col items-center mt-6 space-y-4">
                <button
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    // 使用user-emitter触发事件，通知learn/page.tsx开始播放视频
                    emit('start-play');
                  }}
                >
                  开始演奏
                </button>
                <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer  ">
                  结束演奏
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-700">
              <p className="text-base">你好！</p>
              <p className="mt-2 text-base">请输入或者说出你想听的曲目名称</p>
            </div>
          )
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap wrap-break-word">
                  {message.content}
                </p>
                {message.error && (
                  <p className="text-xs text-red-300 mt-1">{message.error}</p>
                )}
              </div>
            </div>
          ))
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M15 8a7 7 0 11-7-7v2a5 5 0 100 10v2a7 7 0 007-7z"
                  />
                </svg>
                思考中...
              </div>
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
      <div className="pt-3">
        <TextInput
          onSend={handleSend}
          disabled={isLoading}
          placeholder="请输入消息..."
          maxLength={MAX_CHAR_LIMIT}
        />
      </div>
    </div>
  );
};

export default AssistantPanel;
