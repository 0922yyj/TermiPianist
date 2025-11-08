'use client';

import React from 'react';

// 消息组件
const MessageComponent = ({
  message,
}: {
  message: { type: string; content: string; error?: string };
}) => {
  // 根据消息类型渲染不同的内容
  const renderMessageContent = () => {
    switch (message.type) {
      case 'user':
        return (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-blue-500 text-white">
              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                {message.content}
              </p>
              {message.error && (
                <p className="text-xs text-red-300 mt-1">{message.error}</p>
              )}
            </div>
          </div>
        );
      case 'assistant':
        return (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 text-gray-900">
              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                {message.content}
              </p>
            </div>
          </div>
        );
      case 'planning':
        return (
          <div className="flex justify-start">
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
                <span className="text-xs font-medium text-yellow-700">
                  思考过程
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                {message.content}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 text-gray-900">
              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                {message.content}
              </p>
            </div>
          </div>
        );
    }
  };

  return <React.Fragment>{renderMessageContent()}</React.Fragment>;
};

export default MessageComponent;
