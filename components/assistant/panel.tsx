"use client";

import { useRef, useEffect, useMemo } from "react";
import { useGenerativeUIStore } from "@/stores/generativeUIStore";
import type { Message } from "@/stores/generativeUIStore";
import TextInput from "@/components/text-input";
import { useMessageSending } from "@/hooks/useMessageSending";
import { v4 as uuidv4 } from "uuid";

interface AssistantPanelProps {
  thread: unknown;
  onClose?: () => void;
  isCloseBtn?: boolean;
}

const MAX_CHAR_LIMIT = 1000;

const AssistantPanel = ({
  onClose,
  isCloseBtn = true,
  thread,
}: AssistantPanelProps) => {
  const messageListRef = useRef<HTMLDivElement>(null);

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
  const setLoading = useGenerativeUIStore((state) => state.setLoading);
  const setError = useGenerativeUIStore((state) => state.setError);

  // 获取当前会话状态
  const generativeUIState = getSessionState(currentSessionId || undefined);
  
  // 解构会话状态
  const {
    messages: chatMessages = [],
    ui: threadValuesUI = [],
    isLoading = false,
    pendingUserMessage = null,
    error = null,
    threadId: sessionThreadId,
  } = generativeUIState || {};
  
  console.log('chatMessages: ', chatMessages);

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
        behavior: "smooth",
      });
    }
  }, [chatMessages, isLoading]);

  // 使用消息发送 Hook
  const { sendMessage } = useMessageSending(thread);

  // 处理关闭
  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className="flex h-full flex-col w-full px-4">
      {/* 头部 */}
      <div className="flex items-center justify-between py-4 border-b">
        <h2 className="text-lg font-semibold">AI 助手</h2>
        {isCloseBtn && (
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="关闭面板"
          >
            ✕
          </button>
        )}
      </div>

      {/* 消息列表 */}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto py-4 space-y-4"
      >
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="text-base">你好！</p>
            <p className="mt-2 text-sm">有什么可以帮助你的吗？</p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
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
      <div className="border-t py-4">
        <TextInput
          onSend={(text, type, time) => {
            sendMessage({
              id: Math.random().toString(36).slice(2),
              content: text,
              isUser: true,
              status: "FINISH",
              timestamp: Date.now(),
              type,
              time,
            });
          }}
          disabled={isLoading}
          placeholder="请输入消息..."
          maxLength={MAX_CHAR_LIMIT}
        />
      </div>
    </div>
  );
};

export default AssistantPanel;
