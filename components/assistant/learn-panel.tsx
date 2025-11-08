'use client';

import { useRef } from 'react';
import { emit } from '@/hooks/user-emitter';

interface AssistantPanelProps {
  onClose?: () => void;
  isCloseBtn?: boolean;
}

const LearnPanel = ({}: AssistantPanelProps) => {
  const messageListRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full flex-col w-full text-black">
      {/* 头部 */}
      <div className="flex flex-col items-center justify-center pb-4 space-y-2 border-b border-dashed border-gray-500">
        <h3 className="text-md font-semibold">Powered by Termitech</h3>
        <div className="text-sm text-gray-700">学习模式</div>
      </div>

      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto py-4 space-y-4"
      >
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
      </div>
    </div>
  );
};

export default LearnPanel;
