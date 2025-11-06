import PerformLog from './_components/perform-log';
import PerformArea from './_components/perform-area';
export default function PerformPage() {
  return (
    <div className="text-black flex flex-col justify-between gap-4 h-full">
      {/* 演奏区域标题 */}
      {/* <div className="flex flex-col h-full items-center justify-center">
        <div className="text-2xl font-medium mb-4 text-[#0d0d0d]">
          TermiPianist 演奏模式
        </div>
        <div className="text-sm space-y-2">
          <div>
            说啥弹啥：通过语音识别技术，钢琴能“听懂”你的指令，自动演奏出对应的乐曲。
          </div>
        </div>
      </div> */}

       {/* 演奏日志 */}
      <PerformLog />
      {/* 演奏区域 */}
      <PerformArea />
    </div>
  );
}
