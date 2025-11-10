'use client';
import { useEffect, useRef } from 'react';
import { useStream } from '@/hooks/use-stream';
import { useAssistantStore } from '@/stores/assistant';
import PerformLog from './_components/perform-log';
import PerformArea from './_components/perform-area';

export default function PerformPage() {
  // 获取当前会话ID
  const currentSessionId = useAssistantStore(
    (state) => state.currentSessionId || 'session-1'
  );
  // 使用useStream hook
  const { sendStreamRequest } = useStream(currentSessionId);

  // 获取学习数据
  const learningData = useAssistantStore((state) => state.learningData);

  // 使用ref跟踪请求是否已发送，避免重复发送
  const requestSentRef = useRef(false);
  useEffect(() => {
    // 如果有学习数据，并且有文件路径，并且请求尚未发送，则发送请求
    if (
      learningData &&
      learningData.filePaths &&
      learningData.filePaths.length > 0 &&
      !requestSentRef.current
    ) {
      // 标记请求已发送
      requestSentRef.current = true;
      // 发送请求
      sendStreamRequest(learningData.filePaths);

      // 使用后清空数据，避免重复处理
      useAssistantStore.getState().setLearningData({ filePaths: [], mode: '' });
    }
  }, [learningData, sendStreamRequest]);

  return (
    <div className="text-black flex flex-col justify-between gap-4 h-full">
      {/* 演奏日志 */}
      <PerformLog />
      {/* 演奏区域 */}
      <PerformArea />
    </div>
  );
}
