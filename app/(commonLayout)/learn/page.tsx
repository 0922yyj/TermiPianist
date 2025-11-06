export default function LearnPage() {
  return (
    <div className="text-black flex flex-col justify-between gap-4 h-full">
      {/* 演奏区域标题 */}
      <div className="flex flex-col h-full items-center justify-center">
        <div className="text-2xl font-medium mb-4 text-[#0d0d0d]">
          TermiPianist 学习模式
        </div>
        <div className="text-sm space-y-2">
          学啥像啥：借助摄像头学习你的演奏动作，在学习结束后精准复现你的弹奏曲目。
        </div>
      </div>
    </div>
  );
}
