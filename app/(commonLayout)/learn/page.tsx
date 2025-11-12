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

const VideoPlayer = ({ isPlaying, rtmpUrl }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const flvPlayerRef = useRef<FlvPlayer | null>(null);
  const [fallbackToHls, setFallbackToHls] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 将 RTMP URL 转换为可播放的格式
  const convertUrl = (url?: string) => {
    if (!url) return null;

    // 如果是 RTMP URL，尝试转换为 HTTP-FLV
    if (url.startsWith('rtmp://')) {
      // rtmp://192.168.100.51/live/realsense
      // 转换为 http://192.168.100.51:8080/live/realsense.flv
      const urlParts = url.replace('rtmp://', '').split('/');
      console.log('urlParts: ', urlParts);
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
          const player = flvjs.createPlayer({
            type: 'flv',
            url: urls.flv,
          });

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
          测试当前流: {currentRtmpUrl}
        </div>

        {/* 视频播放区域 */}
        {isPlaying && (
          <VideoPlayer isPlaying={isPlaying} rtmpUrl={currentRtmpUrl} />
        )}
      </div>
    </div>
  );
}
