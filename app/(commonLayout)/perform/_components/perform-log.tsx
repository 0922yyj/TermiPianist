'use client';

import { useAssistantStore } from '@/stores/assistant';
import { useRef, useEffect } from 'react';

export default function PerformLog() {
  // 直接从 assistant store 获取演奏日志消息
  const playingLogs = useAssistantStore((state) => state.performLogMessages);

  // 创建日志容器的引用
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // 监听日志变化，自动滚动到底部
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [playingLogs]);

  return (
    <div className="h-[40vh] flex flex-col gap-4 border-1 border-[#41719C] rounded-md p-4">
      <h2 className="font-medium text-lg">演奏日志 ：</h2>

      {playingLogs.length === 0 ? (
        <p className="text-gray-400">暂无演奏日志</p>
      ) : (
        <div
          ref={logsContainerRef}
          className="space-y-1 overflow-y-auto flex-1"
        >
          {playingLogs.map((log) => (
            <div key={log.id} className="space-y-1">
              <p className="text-sm whitespace-pre-wrap">{log.content}</p>
              {/* <p className="text-xs text-gray-500 mt-1">
                {new Date(log.timestamp).toLocaleString()}
              </p> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
