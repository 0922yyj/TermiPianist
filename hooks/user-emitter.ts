import { useEffect } from 'react';
import mitt, { Emitter, Handler } from 'mitt';

export type Events = {
  [key: string]: unknown;
  // 在下方添加特定的事件类型
  'send-message-top': { targetType: 'text' | 'file' };
  'start-play': undefined; // 开始演奏事件
  'change-stream': { url: string }; // 切换流地址事件
  'end-learning': undefined; // 结束演奏事件
};

// 创建 mitt 的单例实例
class EmitterSingleton {
  private static instance: Emitter<Events>;

  private constructor() {
    // 私有构造函数，防止直接实例化
  }

  public static getInstance(): Emitter<Events> {
    if (!EmitterSingleton.instance) {
      EmitterSingleton.instance = mitt<Events>();
    }
    return EmitterSingleton.instance;
  }
}

// 导出单例实例
export const emitter = EmitterSingleton.getInstance();

export function useEmitter<K extends keyof Events>(
  event: K,
  handler: Handler<Events[K]>
) {
  useEffect(() => {
    // 组件挂载时添加事件监听器
    emitter.on(event, handler);

    // 组件卸载时移除事件监听器
    return () => {
      emitter.off(event, handler);
    };
  }, [event, handler]);

  return {
    emit: <E extends keyof Events>(eventName: E, data?: Events[E]) => {
      emitter.emit(eventName, data);
    },
  };
}

// 导出 emit 函数
export function emit<K extends keyof Events>(event: K, data?: Events[K]) {
  emitter.emit(event, data);
}

export default useEmitter;
