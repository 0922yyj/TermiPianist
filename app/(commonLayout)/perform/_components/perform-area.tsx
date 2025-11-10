'use client';
import { useState } from 'react';
import Image from 'next/image';
import { generatePianoKeys, getBlackKeyPosition } from './piano';

export default function PerformArea() {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // 从piano.tsx导入钢琴键盘数据
  const { whiteKeys, blackKeys } = generatePianoKeys();

  const handleKeyClick = (id: string) => {
    setActiveKey(id);

    // 查找对应的键并打印MIDI编号
    const whiteKey = whiteKeys.find((key) => key.id === id);
    if (whiteKey) {
      console.log(`按下白键: ${whiteKey.id}, MIDI编号: ${whiteKey.midiNumber}`);
    } else {
      const blackKey = blackKeys.find((key) => key.id === id);
      if (blackKey) {
        console.log(
          `按下黑键: ${blackKey.id}, MIDI编号: ${blackKey.midiNumber}`
        );
      }
    }

    // 这里可以添加播放音符的逻辑
    setTimeout(() => setActiveKey(null), 300);
  };

  // 验证键盘数量

  return (
    <div className="flex flex-col gap-4 border-1 border-[#41719C] rounded-md p-4">
      <h2 className="text-xl font-bold">演奏区域</h2>

      <div className="relative w-full overflow-x-auto mt-4 pb-4">
        <div className="piano-container relative h-[240px] min-w-[1400px]">
          {/* 键盘标记 - 显示分割线 */}
          <div className="absolute top-0 left-0 w-full flex z-10">
            {whiteKeys.map((key, index) => {
              // 获取当前键的ID信息
              const keyInfo = key.id.split('');
              const noteName = keyInfo[0];

              // 确定是否需要显示分割线
              let needDivider = false;

              // 第一组AB的起始位置
              if (index === 0) {
                needDivider = true;
              }
              // C的位置（每组的起始）
              else if (noteName === 'C') {
                needDivider = true;
              }

              return (
                <div
                  key={`label-${key.id}`}
                  className={`flex-1 h-6 flex items-center justify-center relative ${
                    needDivider ? 'border-l-2 border-gray-300' : ''
                  }`}
                ></div>
              );
            })}
            {/* 添加最后一个分割线 */}
            <div className="absolute top-0 right-0 h-6 border-l-2 border-gray-300"></div>
          </div>

          {/* 红色边框 - 位于分割线下方 */}
          <div className="absolute top-6 left-0 w-full h-1 bg-red-500 z-10"></div>

          {/* 白键 */}
          <div className="white-keys flex h-full pt-6 relative">
            {whiteKeys.map((key, index) => (
              <div
                key={key.id}
                className={`white-key relative flex-1 border-r-2 border-t-0 border-b-2 border-l-0 border-gray-300 rounded-b-md flex items-end justify-center pb-2 cursor-pointer ${
                  activeKey === key.id
                    ? 'bg-yellow-100'
                    : 'bg-gradient-to-b from-white to-gray-50 hover:bg-gray-50'
                } ${index === 0 ? 'border-l-2' : ''}`}
                onClick={() => handleKeyClick(key.id)}
              >
                <span className="absolute bottom-1 text-[10px] text-gray-400">
                  {key.midiNumber}
                </span>
              </div>
            ))}
          </div>

          {/* 黑键 */}
          <div className="black-keys absolute top-6 left-0 w-full h-[60%]">
            {blackKeys.map((blackKey) => {
              const whiteKeyWidth = 100 / whiteKeys.length;
              const whiteKeyIndex = getBlackKeyPosition(blackKey, whiteKeys);

              // 计算黑键位置：在对应白键的右侧
              const leftPosition =
                whiteKeyIndex * whiteKeyWidth + whiteKeyWidth * 0.65;

              return (
                <div
                  key={blackKey.id}
                  className={`black-key absolute h-full cursor-pointer shadow-md ${
                    activeKey === blackKey.id
                      ? 'bg-gray-700'
                      : 'bg-gradient-to-b from-gray-900 to-black hover:bg-gray-800'
                  }`}
                  style={{
                    left: `${leftPosition}%`,
                    width: `${whiteKeyWidth * 0.65}%`,
                    zIndex: 5,
                  }}
                  onClick={() => handleKeyClick(blackKey.id)}
                >
                  <span className="absolute bottom-1 text-[10px] text-white flex justify-center w-full">
                    {blackKey.midiNumber}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 钢琴边框 */}
          {/* <div className="absolute top-6 left-0 w-full h-4 bg-gradient-to-b from-gray-800 to-black rounded-t-md"></div> */}
        </div>
      </div>

      <div className="flex justify-center items-center gap-64 mt-4">
        {/* 左手 */}
        <div className="flex flex-col items-center">
          <Image
            src="/left-palm.svg"
            width={80}
            height={80}
            alt="左手"
            loading="eager"
          />
        </div>
        {/* 右手 */}
        <div className="flex flex-col items-center">
          <Image
            src="/right-palm.svg"
            width={80}
            height={80}
            alt="右手"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
