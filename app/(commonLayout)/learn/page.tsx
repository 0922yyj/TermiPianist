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

interface FlvMediaDataSource {
  type: string;
  url: string;
  isLive?: boolean;
  hasAudio?: boolean;
  hasVideo?: boolean;
}

interface FlvConfig {
  enableWorker?: boolean;
  enableStashBuffer?: boolean;
  stashInitialSize?: number;
  isLive?: boolean;
  lazyLoad?: boolean;
  lazyLoadMaxDuration?: number;
  seekType?: string;
  liveBufferLatencyChasing?: boolean;
  liveBufferLatencyMaxLatency?: number;
  liveBufferLatencyMinRemain?: number;
}

interface FlvJs {
  createPlayer: (
    mediaDataSource: FlvMediaDataSource,
    config?: FlvConfig
  ) => FlvPlayer;
  isSupported: () => boolean;
}

interface VideoPlayerProps {
  isPlaying: boolean;
  rtmpUrl?: string; // 可选的RTMP URL参数
}

const VideoPlayer = ({ isPlaying, rtmpUrl }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const flvPlayerRef = useRef<FlvPlayer | null>(null);
  const [fallbackToHls, setFallbackToHls] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latencyCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 将 RTMP URL 转换为可播放的格式
  const convertUrl = (url?: string) => {
    if (!url) return null;

    // 如果是 RTMP URL，尝试转换为 HTTP-FLV
    if (url.startsWith('rtmp://')) {
      // rtmp://192.168.100.51/live/realsense
      // 转换为 http://192.168.100.51:8080/live/realsense.flv
      const urlParts = url.replace('rtmp://', '').split('/');
      const host = urlParts[0];
      const path = urlParts.slice(1).join('/');

      return {
        flv: `http://${host}:8080/${path}.flv`,
        hls: `http://${host}:8080/${path}.m3u8`,
        original: url,
      };
    }

    // 如果已经是 HTTP URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (url.endsWith('.flv')) {
        return { flv: url, hls: null, original: url };
      } else if (url.endsWith('.m3u8')) {
        return { flv: null, hls: url, original: url };
      }
    }

    return { flv: null, hls: null, original: url };
  };

  useEffect(() => {
    if (!isPlaying || !rtmpUrl || !videoRef.current) return;

    const urls = convertUrl(rtmpUrl);
    if (!urls) {
      setErrorMessage('无效的流地址');
      return;
    }

    // 清理之前的播放器
    if (flvPlayerRef.current) {
      try {
        flvPlayerRef.current.destroy();
        flvPlayerRef.current = null;
      } catch (e) {
        console.error('清理播放器失败:', e);
      }
    }

    const initPlayer = async () => {
      try {
        // 动态导入 flv.js
        const flvjs = (await import('flv.js')).default as unknown as FlvJs;

        if (!flvjs.isSupported()) {
          setErrorMessage(
            '浏览器不支持 FLV 播放，请使用 Chrome 或 Edge 浏览器'
          );
          return;
        }

        // 尝试使用 HTTP-FLV
        if (urls.flv && videoRef.current) {
          setErrorMessage(null);
          const player = flvjs.createPlayer(
            {
              type: 'flv',
              url: urls.flv,
              isLive: true, // 标记为直播流
              hasAudio: false, // 如果有音频，改为true
              hasVideo: true,
            },
            {
              enableWorker: false, // 在某些情况下禁用Worker可以减少延迟
              enableStashBuffer: false, // 禁用IO存储缓冲区
              stashInitialSize: 128, // 减少初始缓冲大小（KB）
              isLive: true,
              lazyLoad: false,
              lazyLoadMaxDuration: 0.2,
              seekType: 'range',
              // 低延迟直播配置
              liveBufferLatencyChasing: true, // 启用延迟追赶
              liveBufferLatencyMaxLatency: 1.5, // 最大延迟1.5秒
              liveBufferLatencyMinRemain: 0.3, // 最小保留0.3秒缓冲
            }
          );

          player.attachMediaElement(videoRef.current);

          player.on('error', (error) => {
            console.error('error: ', error);
            setErrorMessage(
              `播放失败：无法连接到流服务器 ${urls.flv}。\n` +
                '请确保：\n' +
                '1. RTMP 服务器正在运行\n' +
                '2. 服务器支持 HTTP-FLV 输出（端口 8080）\n' +
                '3. 流名称正确\n\n' +
                '原始地址: ' +
                urls.original
            );

            // 尝试 HLS 作为后备
            if (urls.hls && !fallbackToHls) {
              setFallbackToHls(true);
            }
          });

          player.load();
          await player.play();

          flvPlayerRef.current = player;

          // 启动延迟监控：自动追赶到最新帧
          if (videoRef.current) {
            const video = videoRef.current;

            // 清除之前的定时器
            if (latencyCheckIntervalRef.current) {
              clearInterval(latencyCheckIntervalRef.current);
            }

            // 每秒检查一次延迟
            latencyCheckIntervalRef.current = setInterval(() => {
              if (!video.paused && video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(
                  video.buffered.length - 1
                );
                const currentTime = video.currentTime;
                const latency = bufferedEnd - currentTime;

                // 如果延迟超过2秒，跳到最新位置
                if (latency > 2) {
                  video.currentTime = bufferedEnd - 0.3; // 保留0.3秒缓冲
                }
              }
            }, 1000);
          }
        } else if (urls.hls && videoRef.current) {
          // 使用 HLS (Safari 原生支持，其他浏览器可能需要 hls.js)
          setErrorMessage('尝试使用 HLS 播放...');
          videoRef.current.src = urls.hls;
          await videoRef.current.play();
          setErrorMessage(null);
        } else {
          setErrorMessage(
            `无法播放 RTMP 流，需要服务器端支持。\n\n` +
              `原始地址: ${urls.original}\n\n` +
              `建议：\n` +
              `1. 使用 nginx-rtmp-module 将 RTMP 转为 HTTP-FLV\n` +
              `2. 或使用 FFmpeg 转码为 HLS\n` +
              `3. 或使用 Node-Media-Server 等流媒体服务器`
          );
        }
      } catch (error) {
        setErrorMessage('播放器初始化失败: ' + (error as Error).message);
      }
    };

    initPlayer();

    // 清理函数
    return () => {
      // 清除延迟检测定时器
      if (latencyCheckIntervalRef.current) {
        clearInterval(latencyCheckIntervalRef.current);
        latencyCheckIntervalRef.current = null;
      }

      if (flvPlayerRef.current) {
        try {
          flvPlayerRef.current.destroy();
          flvPlayerRef.current = null;
        } catch (e) {
          console.error('清理播放器失败:', e);
        }
      }
    };
  }, [isPlaying, rtmpUrl, fallbackToHls]);

  return (
    <div className="w-full max-w-6xl mx-auto rounded-lg overflow-hidden flex flex-col items-center justify-center">
      {/* {errorMessage && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 text-sm w-[90%] mx-auto mb-4 rounded whitespace-pre-line">
          {errorMessage}
        </div>
      )} */}
      <div className="flex justify-center items-center w-full">
        <video
          ref={videoRef}
          className="w-[90%] aspect-video min-h-[500px] h-[55vh] mx-auto block bg-black"
          controls
          autoPlay
          muted
          playsInline // 移动端内联播放，减少延迟
          preload="auto" // 预加载
          style={{
            objectFit: 'contain',
          }}
        />
      </div>
    </div>
  );
};

interface LearnPageProps {
  rtmpUrl?: string; // 可选的RTMP URL参数
}

export default function LearnPage({ rtmpUrl }: LearnPageProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRtmpUrl, setCurrentRtmpUrl] = useState(rtmpUrl);
  const [isEnding, setIsEnding] = useState(false); // 新增：控制结束时的遮罩层

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

  // 监听结束演奏事件，显示遮罩层
  useEmitter('end-learning', () => {
    setIsEnding(true);
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
        {/* 视频播放区域 */}
        {isPlaying && (
          <div className="relative w-full">
            <VideoPlayer
              isPlaying={isPlaying}
              // rtmpUrl={'rtmp://192.168.1.167/live/realsense'}
              rtmpUrl={currentRtmpUrl}
            />
            {/* 结束演奏时的遮罩层 */}
            {isEnding && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
                <div className="flex flex-col items-center space-y-4 text-white">
                  {/* 加载动画 */}
                  <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <div className="text-2xl font-semibold">处理中...</div>
                  <div className="text-sm text-gray-300">
                    正在保存您的演奏数据
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
