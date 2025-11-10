"use client";
// import { getGenerativeUIButtonDisabledState } from '@/utils/generativeUIUtils';
import { sendAdvancedMessage } from "@/utils/send-button";
import { useGenerativeUIStore } from "@/stores/generativeUIStore";
import { v4 as uuidv4 } from "uuid";
import { emit } from "./user-emitter";
/**
 * 消息发送 Hook
 * 负责处理消息发送逻辑和状态管理
 */
export const useMessageSending = (thread: any) => {
  const generativeUICurrentSessionId = useGenerativeUIStore(
    (state) => state.currentSessionId
  );

  const sendMessage = async (message: any) => {

    // 生成会话ID
    const sessionId = generativeUICurrentSessionId || uuidv4();

    try {
      await sendAdvancedMessage(message, thread, {
        createSession: !generativeUICurrentSessionId,
        createSessionState: !generativeUICurrentSessionId,
        sessionId: sessionId,
        emitTop: true,
        // isInterrupted: isInterrupted,
        onSuccess: () => {
          // 发送消息置顶
          setTimeout(() => {
            emit("send-message-top", {
              targetType: "text",
            });
          }, 50);
        },
        onError: (error) => {
          console.error("发送消息失败:", error);
        },
      });
    } catch (error) {
      console.error("发送消息失败:", error);
    }
  };

  return {
    sendMessage,
    // isDisabled,
  };
};
