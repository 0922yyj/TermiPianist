"use client";
import { useGenerativeUIStore } from "@/stores/generativeUIStore";

export const sendAdvancedMessage = async (
  message: any,
  thread: any,
  options: any
) => {
  const {
    createSessionState = false,
    sessionId,
    emitTop = false,
    onSuccess,
    onError,
    isInterrupted = false,
  } = options;

  // 获取store方法
  const {
    addMessage,
    setLoading,
    setError,
    createSessionState: createSessionStateFn,
  } = useGenerativeUIStore.getState();

  const currentSessionId = useGenerativeUIStore.getState().currentSessionId;
  const finalSessionId = sessionId || currentSessionId;

  if (!finalSessionId) {
    const errorMsg = "没有会话ID";
    console.error(errorMsg);
    onError?.(errorMsg);
    return;
  }

  // 如果需要创建会话状态
  if (createSessionState && !currentSessionId) {
    createSessionStateFn(finalSessionId);
  }

  const isVoice = message.type && message.type === "voice";
  const duration = message?.time;

  // 立即添加用户消息
  const userMessage = {
    id: message.id || Date.now().toString(),
    role: "user" as const,
    content: message.content,
    timestamp: Date.now(),
  };

  // 添加用户消息到store
  addMessage(userMessage, finalSessionId);
  setLoading(true, finalSessionId);
  setError(null, finalSessionId);

  try {
    // 使用基础的消息发送函数
    await sendMessageToThread(message.content, thread, finalSessionId, {
      isVoice,
      duration,
      type: message.type,
      time: message.time,
      isInterrupted: isInterrupted, // 使用传入的中断状态
      onSuccess,
      onError,
      emitTop,
    });
  } catch (error) {
    setError("发送消息失败，请稍后再试", finalSessionId);
    onError?.("发送消息失败，请稍后再试");
  } finally {
    setLoading(false, finalSessionId);
  }
};

/**
 * 统一的发送消息到生成式UI的函数
 * @param content 消息内容
 * @param thread thread实例
 * @param currentSessionId 当前会话ID
 * @param options 消息发送选项
 */
const sendMessageToThread = async (
  content: string,
  thread: any,
  currentSessionId: string | null,
  options: any
) => {
  const {
    isVoice = false,
    duration,
    type,
    time,
    isInterrupted = false,
    onSuccess,
    onError,
  } = options;

  if (!thread) {
    const errorMsg = "Thread未初始化，请稍候...";
    console.error(errorMsg);
    onError?.(errorMsg);
    return;
  }

  if (!currentSessionId) {
    const errorMsg = "没有当前会话ID";
    console.error(errorMsg);
    onError?.(errorMsg);
    return;
  }

  // 获取store方法
  const { setLoading, setError } = useGenerativeUIStore.getState();

  const sessionId = currentSessionId;

  // 立即添加用户消息到待处理状态
  /* const userMessage = {
    id: messageId,
    type: 'human',
    content: content,
    timestamp: Date.now(),
    isVoice: isVoice,
    duration: duration,
  }; */

  // 设置待处理用户消息
  // setPendingUserMessage(userMessage, sessionId);
  setLoading(true, sessionId);
  setError(null, sessionId);

  try {
    const submitData = {
      content: content,
      sessionId: sessionId,
    };

    const submitOptions = {
      isVoice: isVoice,
      duration: duration,
      type: type,
      time: time,
      isInterrupted: isInterrupted,
    };

    // 使用生成式UI的submit方法
    await thread.submit(submitData, submitOptions);

    // 发送消息置顶（如果需要）
    // if (emitTop) {
    //   setTimeout(() => {
    //     // 这里需要导入emit函数，或者通过参数传递
    //     // emit('send-message-top', { targetType: 'text' });
    //   }, 50);
    // }

    onSuccess?.();
  } catch (error) {
    console.error("Thread submit error:", error);
    const errorMsg = "发送消息失败，请稍后再试";
    setError(errorMsg, sessionId);
    onError?.(errorMsg);
  } finally {
    setLoading(false, sessionId);
  }
};
