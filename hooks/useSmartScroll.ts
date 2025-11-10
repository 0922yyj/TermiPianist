'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseSmartScrollOptions {
  /** 自动恢复滚动的超时时间(毫秒) */
  autoScrollResumeTime?: number;
  /** 判定为用户滚动的阈值(像素) */
  scrollThreshold?: number;
}

/**
 * 智能滚动 Hook，提供以下功能：
 * 1. 自动滚动到底部
 * 2. 当用户手动滚动时暂停自动滚动
 * 3. 用户停止交互一段时间后恢复自动滚动
 *
 * @param dependencies 触发自动滚动的依赖数组
 * @param options 配置选项
 * @returns 包含容器引用和滚动处理函数的对象
 */
export function useSmartScroll(
  dependencies: any[] = [],
  options: UseSmartScrollOptions = {}
) {
  // 设置默认选项
  const { autoScrollResumeTime = 3000, scrollThreshold = 50 } = options;

  // 创建容器引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 用户滚动状态
  const [userScrolling, setUserScrolling] = useState(false);
  const [lastUserInteraction, setLastUserInteraction] = useState(0);

  // 处理滚动事件
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // 如果用户向上滚动，标记为用户正在滚动
    if (scrollHeight - scrollTop - clientHeight > scrollThreshold) {
      setUserScrolling(true);
      setLastUserInteraction(Date.now());
    } else {
      setUserScrolling(false);
    }
  };

  // 监听依赖变化，根据条件自动滚动到底部
  useEffect(() => {
    // 如果没有用户滚动，或者用户最后交互时间超过设定时间，则自动滚动
    const shouldAutoScroll =
      !userScrolling || Date.now() - lastUserInteraction > autoScrollResumeTime;

    if (containerRef.current && shouldAutoScroll) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, userScrolling, lastUserInteraction]);

  // 手动滚动到底部的方法
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  return {
    containerRef,
    handleScroll,
    scrollToBottom,
    userScrolling,
  };
}

export default useSmartScroll;
