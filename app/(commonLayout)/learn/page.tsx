'use client';

import { useState, useEffect, useRef } from 'react';
import useEmitter from '@/hooks/user-emitter';

// 定义flv.js的类型
interface FlvPlayer {
  attachMediaElement: (element: HTMLMediaElement) => void;
  load: () => void;
  play: () => Promise<void>;
  destroy: () => void;
  on: (event: string, callback: (error: unknown) => void) => void;
}

interface FlvJs {
  createPlayer: (config: { type: string; url: string }) => FlvPlayer;
  isSupported: () => boolean;
}

interface VideoPlayerProps {
  isPlaying: boolean;
  rtmpUrl?: string; // 可选的RTMP URL参数
}

const VideoPlayer = ({
  isPlaying,
  rtmpUrl = 'rtmp://192.168.100.63/live/realsense',
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const flvPlayerRef = useRef<FlvPlayer | null>(null);
  const [fallbackToHls, setFallbackToHls] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let flvPlayer: FlvPlayer | null = null;
    let flvJs: FlvJs | null = null;
    let playAttemptTimeout: NodeJS.Timeout | null = null;
    // 保存当前的video元素引用，以防止在清理函数中使用可能已更改的ref
    const videoElement = videoRef.current;

    const loadFlvJs = async () => {
      // 首先清理之前的播放实例
      if (flvPlayerRef.current) {
        flvPlayerRef.current.destroy();
        flvPlayerRef.current = null;
      }

      // 确保视频元素已重置
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
      }

      // 如果不需要播放或已经切换到HLS模式，则直接返回
      if (!isPlaying || fallbackToHls || !videoElement) {
        return;
      }

      // 添加延时，确保之前的播放操作已完全停止
      playAttemptTimeout = setTimeout(async () => {
        if (typeof window !== 'undefined') {
          try {
            // 仅在客户端导入flv.js
            const flvModule = await import('flv.js');
            // 使用类型断言处理类型问题
            flvJs = (flvModule.default || flvModule) as unknown as FlvJs;

            if (
              flvJs &&
              flvJs.isSupported() &&
              videoElement &&
              isPlaying &&
              !fallbackToHls
            ) {
              // 注意：这里需要使用HTTP-FLV流而不是RTMP流
              // RTMP协议(rtmp://)不被浏览器直接支持，需要使用HTTP-FLV(http://)或HLS(http://)格式
              // 使用原始RTMP流地址的对应HTTP-FLV地址
              // 注意：这里需要确保服务器已经配置了将RTMP流转换为HTTP-FLV流
              // 如果没有这样的转换服务，这个地址将无法访问
              // 从提供的RTMP URL中提取流标识符
              const streamKey = rtmpUrl.split('/').pop() || 'realsense';

              flvPlayer = flvJs.createPlayer({
                type: 'flv',
                // 假设流媒体服务器在同一IP上的不同端口提供HTTP-FLV服务
                url: `http://192.168.100.63:8080/live/${streamKey}.flv`,
              });

              // 添加错误处理
              flvPlayer.on('error', (err: unknown) => {
                console.error('flv player error:', err);
                setErrorMessage(
                  `视频加载失败: ${
                    err instanceof Error ? err.message : '未知错误'
                  }`
                );
                setFallbackToHls(true); // 失败时尝试使用HLS
              });

              flvPlayer.attachMediaElement(videoElement);
              flvPlayer.load();

              try {
                await flvPlayer.play();
                flvPlayerRef.current = flvPlayer;
              } catch (err) {
                console.error('播放失败:', err);
                setErrorMessage(
                  `播放失败: ${err instanceof Error ? err.message : '未知错误'}`
                );
                setFallbackToHls(true);
              }
            }
          } catch (error) {
            console.error('flv.js 加载失败:', error);
            setErrorMessage(
              `flv.js 加载失败: ${(error as Error)?.message || '未知错误'}`
            );
            setFallbackToHls(true); // 失败时尝试使用HLS
          }
        }
      }, 300); // 增加延时时间，确保之前的播放操作已完全停止
    };

    loadFlvJs();

    return () => {
      // 清理定时器
      if (playAttemptTimeout) {
        clearTimeout(playAttemptTimeout);
      }

      // 清理flv播放器
      if (flvPlayerRef.current) {
        flvPlayerRef.current.destroy();
        flvPlayerRef.current = null;
      }

      // 清理视频元素，使用保存的引用
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
      }
    };
  }, [isPlaying, fallbackToHls, rtmpUrl]);

  // 如果flv.js失败，尝试使用原生HLS
  useEffect(() => {
    let playPromise: Promise<void> | undefined;
    let hlsTimeoutId: NodeJS.Timeout | null = null;
    // 保存当前的video元素引用，以防止在清理函数中使用可能已更改的ref
    const videoElement = videoRef.current;

    if (fallbackToHls && videoElement && isPlaying) {
      // 在设置新的src之前，确保之前的播放已经停止
      if (flvPlayerRef.current) {
        flvPlayerRef.current.destroy();
        flvPlayerRef.current = null;
      }

      // 清除之前的视频源
      videoElement.pause();
      videoElement.removeAttribute('src');
      videoElement.load();

      // 添加延时，确保之前的播放操作已完全停止
      hlsTimeoutId = setTimeout(() => {
        if (videoElement) {
          // 尝试使用HLS
          // 从提供的RTMP URL中提取流标识符
          const streamKey = rtmpUrl.split('/').pop() || 'realsense';
          videoElement.src = `http://192.168.100.63:8080/live/${streamKey}.m3u8`;

          // 使用可中断的方式播放
          try {
            playPromise = videoElement.play();
            if (playPromise !== undefined) {
              playPromise.catch((err) => {
                console.error('HLS播放失败:', err);
                setErrorMessage(
                  `HLS播放失败: ${
                    err instanceof Error ? err.message : '未知错误'
                  }`
                );
              });
            }
          } catch (err) {
            console.error('HLS播放异常:', err);
            setErrorMessage(
              `HLS播放异常: ${err instanceof Error ? err.message : '未知错误'}`
            );
          }
        }
      }, 300); // 增加延时时间，确保之前的播放操作已完全停止
    }

    return () => {
      // 清理定时器
      if (hlsTimeoutId) {
        clearTimeout(hlsTimeoutId);
      }

      // 如果组件卸载时有正在进行的播放请求，则中断它
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
      }
    };
  }, [fallbackToHls, isPlaying, rtmpUrl]);

  return (
    <div className="w-full max-w-6xl mx-auto rounded-lg overflow-hidden flex flex-col items-center justify-center">
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 text-sm w-[90%] mx-auto text-center">
          {errorMessage}
        </div>
      )}
      <div className="flex justify-center items-center w-full">
        <video
          ref={videoRef}
          className="w-[90%] aspect-video min-h-[500px] h-[55vh] mx-auto block"
          controls
          autoPlay
        />
      </div>
    </div>
  );
};

interface LearnPageProps {
  rtmpUrl?: string; // 可选的RTMP URL参数
}

export default function LearnPage({
  rtmpUrl = 'rtmp://192.168.100.63/live/realsense',
}: LearnPageProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRtmpUrl, setCurrentRtmpUrl] = useState(rtmpUrl);

  // 使用useEmitter监听来自panel.tsx的开始演奏按钮点击事件
  useEmitter('start-play', () => {
    setIsPlaying(true);
  });

  // 监听自定义的流切换事件
  useEmitter('change-stream', (data: { url: string }) => {
    if (data?.url) {
      setCurrentRtmpUrl(data.url);
      // 如果已经在播放，则重新播放
      if (isPlaying) {
        // 先停止当前播放，然后重新启动
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 100);
      }
    }
  });

  return (
    <div className="text-black flex flex-col justify-between gap-4 h-full w-full">
      {/* 演奏区域标题 */}
      <div className="flex flex-col h-full items-center justify-center w-full">
        <div className="text-2xl font-medium mb-4 text-[#0d0d0d]">
          TermiPianist 学习模式
        </div>
        <div className="text-sm space-y-2 mb-6">
          学啥像啥：借助摄像头学习你的演奏动作，在学习结束后精准复现你的弹奏曲目。
        </div>

        {/* 当前流地址显示 */}
        <div className="text-xs text-gray-500 mb-2 w-full max-w-6xl mx-auto">
          当前流: {currentRtmpUrl}
        </div>

        {/* 视频播放区域 */}
        {isPlaying && (
          <VideoPlayer isPlaying={isPlaying} rtmpUrl={currentRtmpUrl} />
        )}
      </div>
    </div>
  );
}
