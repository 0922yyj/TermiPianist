"use client";

import AssistantPanel from "./assistant/panel";
import { useGenerativeUIStore } from "@/stores/generativeUIStore";
import { useMessageProcessing } from "@/hooks/useMessageProcessing";

const AppLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { currentSessionId } = useGenerativeUIStore();
  console.log('currentSessionId: ', currentSessionId);
  const thread = useMessageProcessing(currentSessionId);
  console.log('thread: ', thread);
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 左侧边栏 - 20% */}
      <aside className="w-[10%] bg-[#f3f3f3] border-r overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">左侧边栏</h2>
          {/* 在这里添加左侧内容 */}
        </div>
      </aside>

      {/* 中间主内容区 - 60% */}
      <main className="w-[60%] bg-white overflow-y-auto">
        <div className="p-4">{children}</div>
      </main>

      {/* 右侧边栏 - 20% */}
      <aside className="w-[30%] bg-[#f3f3f3] border-l overflow-y-auto">
        <div className="p-4 h-full">
          {/* 在这里添加右侧内容 */}
          <AssistantPanel thread={thread} />
        </div>
      </aside>
    </div>
  );
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
