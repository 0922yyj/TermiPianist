'use client';
import { useState } from 'react';

// 定义键盘按键类型
type WhiteKey = {
  note: string;
  id: string;
  label: string;
};

type BlackKey = {
  note: string;
  id: string;
  afterWhiteKey: string;
};

export default function PerformArea() {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // 生成钢琴键盘布局
  // 按照要求：52个白键（第一组AB，七组CDEFGAB，最后一组C）和36个黑键

  // 构建白键数组
  const whiteKeys: WhiteKey[] = [
    // 第一组：AB
    { note: 'A', id: 'A0', label: 'A' },
    { note: 'B', id: 'B0', label: 'B' },
  ];

  // 七组 CDEFGAB
  for (let octave = 1; octave <= 7; octave++) {
    whiteKeys.push({ note: 'C', id: `C${octave}`, label: 'C' });
    whiteKeys.push({ note: 'D', id: `D${octave}`, label: 'D' });
    whiteKeys.push({ note: 'E', id: `E${octave}`, label: 'E' });
    whiteKeys.push({ note: 'F', id: `F${octave}`, label: 'F' });
    whiteKeys.push({ note: 'G', id: `G${octave}`, label: 'G' });
    whiteKeys.push({ note: 'A', id: `A${octave}`, label: 'A' });
    whiteKeys.push({ note: 'B', id: `B${octave}`, label: 'B' });
  }

  // 最后一组：C
  whiteKeys.push({ note: 'C', id: 'C8', label: 'C' });

  // 构建黑键数组
  const blackKeys: BlackKey[] = [];

  // 第一组AB之间的黑键
  blackKeys.push({
    note: 'A#',
    id: 'A#0',
    afterWhiteKey: 'A0',
  });

  // 按照规律：CDE之间有2个黑键，FGAB之间有3个黑键
  for (let octave = 1; octave <= 7; octave++) {
    // CDE之间的两个黑键
    blackKeys.push({
      note: 'C#',
      id: `C#${octave}`,
      afterWhiteKey: `C${octave}`,
    });
    blackKeys.push({
      note: 'D#',
      id: `D#${octave}`,
      afterWhiteKey: `D${octave}`,
    });

    // FGAB之间的三个黑键
    blackKeys.push({
      note: 'F#',
      id: `F#${octave}`,
      afterWhiteKey: `F${octave}`,
    });
    blackKeys.push({
      note: 'G#',
      id: `G#${octave}`,
      afterWhiteKey: `G${octave}`,
    });
    blackKeys.push({
      note: 'A#',
      id: `A#${octave}`,
      afterWhiteKey: `A${octave}`,
    });
  }

  // 计算黑键位置的辅助函数
  const getBlackKeyPosition = (blackKey: BlackKey) => {
    const whiteKeyIndex = whiteKeys.findIndex(
      (k) => k.id === blackKey.afterWhiteKey
    );
    if (whiteKeyIndex === -1) return 0;
    return whiteKeyIndex;
  };

  const handleKeyClick = (id: string) => {
    setActiveKey(id);
    // 这里可以添加播放音符的逻辑
    setTimeout(() => setActiveKey(null), 300);
  };

  // 验证键盘数量
  console.log(`白键数量: ${whiteKeys.length}, 黑键数量: ${blackKeys.length}`);

  return (
    <div className="flex flex-col gap-4 border-1 border-[#41719C] rounded-md p-4">
      <h2 className="text-xl font-bold">演奏区域</h2>

      <div className="relative w-full overflow-x-auto">
        <div className="piano-container relative h-[240px] min-w-[1400px]">
          {/* 键盘标记 - 显示字母分布 */}
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
                  className={`flex-1 h-6 flex items-center justify-center text-xs font-bold relative ${
                    needDivider ? 'border-l-2 border-gray-300' : ''
                  }`}
                >
                  {key.label}
                </div>
              );
            })}
            {/* 添加最后一个分割线 */}
            <div className="absolute top-0 right-0 h-6 border-l-2 border-gray-300"></div>
          </div>

          {/* 红色边框 - 位于字母下方 */}
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
              ></div>
            ))}
          </div>

          {/* 黑键 */}
          <div className="black-keys absolute top-6 left-0 w-full h-[60%]">
            {blackKeys.map((blackKey) => {
              const whiteKeyWidth = 100 / whiteKeys.length;
              const whiteKeyIndex = getBlackKeyPosition(blackKey);

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
                />
              );
            })}
          </div>

          {/* 钢琴边框 */}
          {/* <div className="absolute top-6 left-0 w-full h-4 bg-gradient-to-b from-gray-800 to-black rounded-t-md"></div> */}
        </div>
      </div>

      <div className="text-sm mt-2">
        <p>钢琴键盘：52个白键，36个黑键</p>
        <p>白键分布：第一组AB，七组CDEFGAB，最后一组C</p>
        <p>黑键分布：CDE之间有2个黑键，FGAB之间有3个黑键</p>
      </div>
    </div>
  );
}
