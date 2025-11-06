"use client";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useMemo } from "react";
import { useGenerativeUIStore } from "@/stores/generativeUIStore";

/**
 * 消息处理 Hook
 * 负责处理 LangGraph 消息流和增量消息更新
 */
export const useMessageProcessing = (currentSessionId: string | null) => {
  
  const setError = useGenerativeUIStore((state) => state.setError);
  const addMessage = useGenerativeUIStore((state) => state.addMessage);
  // 使用 useMemo 来稳定 apiUrl，构造完整的 URL
  const stableApiUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    // 使用当前页面的 origin 构造完整 URL，让 Next.js 代理转发
    const origin = window.location.origin;
    const apiUrl = `${origin}/services/drone-agent-ui`;
    
    return apiUrl;
  }, []);

  // 动态配置 useStream
  // 重要：不传 threadId，让 LangGraph SDK 在第一次提交时自动创建 thread
  const thread = useStream({
    apiUrl: stableApiUrl,
    assistantId: "swarm_multi_agent",
    // threadId: 不传，让后端自动创建
    fetchStateHistory: true, // 必须设置为 true，用于 experimental_branchTree
    onError: (error) => {
      
      const errorMessage = "请求出错，请稍后再试";
      if (currentSessionId) {
        setError(errorMessage, currentSessionId);
      }
    },
    onFinish: (state) => {
      

      // 处理AI响应消息
      if (currentSessionId && state && "values" in state) {
        const stateValues = state.values as any;
        const messages = stateValues?.messages || [];

        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];

          // 如果是AI的响应消息，添加到store
          if (
            lastMessage &&
            (lastMessage.type === "ai" || lastMessage.role === "assistant")
          ) {
            const content =
              typeof lastMessage.content === "string"
                ? lastMessage.content
                : lastMessage.content?.[0]?.text || "";

            const aiMessage = {
              id: lastMessage.id || Date.now().toString(),
              role: "assistant" as const,
              content: content,
              timestamp: Date.now(),
            };
            addMessage(aiMessage, currentSessionId);
          }
        }
      }
    },
  });

  return thread;
};
