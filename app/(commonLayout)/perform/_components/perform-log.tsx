'use client';

import { useAssistantStore } from '@/stores/assistant';
import { useSmartScroll } from '@/hooks/useSmartScroll';

export default function PerformLog() {
  // 直接从 assistant store 获取演奏日志消息
  const playingLogs = useAssistantStore((state) => state.performLogMessages);

  // 使用智能滚动 hook，传入日志数组作为依赖
  const { containerRef, handleScroll } = useSmartScroll([playingLogs], {
    autoScrollResumeTime: 3000, // 3秒后恢复自动滚动
    scrollThreshold: 50, // 50像素的滚动阈值
  });

  return (
    <div className="h-[40vh] flex flex-col gap-4 border-1 border-[#41719C] rounded-md p-4">
      <h2 className="font-medium text-lg">演奏日志 ：</h2>

      {playingLogs.length === 0 ? (
        <p className="text-gray-400">暂无演奏日志</p>
      ) : (
        <div
          ref={containerRef}
          className="space-y-1 overflow-y-auto flex-1"
          onScroll={handleScroll}
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
