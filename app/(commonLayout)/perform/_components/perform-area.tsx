'use client';
import { useEffect, useReducer, useRef } from 'react';
// import Image from 'next/image';
import { generatePianoKeys, getBlackKeyPosition } from './piano';
import { useAssistantStore } from '@/stores/assistant';
import { KeyPositionContent } from '@/stores/assistant/type';

// 定义状态类型
type ActiveKeysState = Map<number, { keyId: string; hand: string }>;

// 定义动作类型
type ActiveKeysAction =
  | { type: 'NOTE_ON'; midiId: number; keyId: string; hand: string }
  | { type: 'NOTE_OFF'; midiId: number };

// 定义reducer
function activeKeysReducer(
  state: ActiveKeysState,
  action: ActiveKeysAction
): ActiveKeysState {
  const newState = new Map(state);

  switch (action.type) {
    case 'NOTE_ON':
      newState.set(action.midiId, { keyId: action.keyId, hand: action.hand });
      return newState;
    case 'NOTE_OFF':
      newState.delete(action.midiId);
      return newState;
    default:
      return state;
  }
}

export default function PerformArea() {
  // 从piano.tsx导入钢琴键盘数据
  const { whiteKeys, blackKeys } = generatePianoKeys();

  // 使用useReducer存储激活的键，键为midi_id，值为{keyId, hand}
  const [activeKeys, dispatchActiveKeys] = useReducer(
    activeKeysReducer,
    new Map<number, { keyId: string; hand: string }>()
  );
  const keyPositionMessages = useAssistantStore(
    (state) => state.keyPositionMessages
  );

  useEffect(() => {
    console.log('keyPositionMessages', keyPositionMessages);
  }, [keyPositionMessages]);

  // 使用ref跟踪已处理的消息ID集合，避免重复处理
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // 处理所有新的键位消息
  useEffect(() => {
    // 如果没有消息，直接返回
    if (keyPositionMessages.length === 0) return;

    // 遍历所有消息，处理未处理过的消息
    keyPositionMessages.forEach((message) => {
      // 检查是否已处理过该消息
      if (processedMessageIdsRef.current.has(message.id)) {
        return; // 已处理过，跳过
      }

      console.log('处理消息', message);

      // 添加到已处理集合
      processedMessageIdsRef.current.add(message.id);

      // 处理消息内容
      const content = message.content as KeyPositionContent;
      console.log('content', content);

      // 确保content是对象类型
      if (typeof content !== 'object' || !content) return;

      // 根据midi_id查找对应的键
      const midiId = content.midi_id;
      const action = content.action;
      console.log('action', action);
      const hand = content.hand; // 'left' 或 'right'

      // 查找对应的键
      const whiteKey = whiteKeys.find((key) => key.midiNumber === midiId);
      const blackKey = blackKeys.find((key) => key.midiNumber === midiId);
      const keyId = whiteKey?.id || blackKey?.id;

      if (keyId) {
        // 使用reducer处理状态更新
        if (action === 'note_on') {
          console.log('按下按键', midiId, keyId, hand);
          dispatchActiveKeys({
            type: 'NOTE_ON',
            midiId,
            keyId,
            hand,
          });
        } else if (action === 'note_off') {
          console.log('释放按键', midiId);
          dispatchActiveKeys({
            type: 'NOTE_OFF',
            midiId,
          });
        }
      }
    });
  }, [keyPositionMessages, whiteKeys, blackKeys]);
  // 计算钢琴的中间位置
  const totalWhiteKeys = whiteKeys.length;
  const middleKeyIndex = Math.floor(totalWhiteKeys / 2);

  const handleKeyClick = (id: string) => {
    // 查找对应的键并确定是左侧还是右侧
    const whiteKey = whiteKeys.find((key) => key.id === id);
    if (whiteKey) {
      const keyIndex = whiteKeys.findIndex((key) => key.id === id);
      const side = keyIndex < middleKeyIndex ? 'left' : 'right';

      // 手动模拟按键
      dispatchActiveKeys({
        type: 'NOTE_ON',
        midiId: whiteKey.midiNumber,
        keyId: id,
        hand: side,
      });

      console.log(
        `按下白键: ${whiteKey.id}, MIDI编号: ${whiteKey.midiNumber}, 位置: ${side}`
      );
    } else {
      const blackKey = blackKeys.find((key) => key.id === id);
      if (blackKey) {
        // 对于黑键，我们需要找到它对应的白键位置
        const whiteKeyIndex = getBlackKeyPosition(blackKey, whiteKeys);
        const side = whiteKeyIndex < middleKeyIndex ? 'left' : 'right';

        // 手动模拟按键
        dispatchActiveKeys({
          type: 'NOTE_ON',
          midiId: blackKey.midiNumber,
          keyId: id,
          hand: side,
        });

        console.log(
          `按下黑键: ${blackKey.id}, MIDI编号: ${blackKey.midiNumber}, 位置: ${side}`
        );
      }
    }

    // 这里可以添加播放音符的逻辑
    setTimeout(() => {
      // 释放按键
      if (whiteKey) {
        dispatchActiveKeys({
          type: 'NOTE_OFF',
          midiId: whiteKey.midiNumber,
        });
      } else {
        const foundBlackKey = blackKeys.find((key) => key.id === id);
        if (foundBlackKey) {
          dispatchActiveKeys({
            type: 'NOTE_OFF',
            midiId: foundBlackKey.midiNumber,
          });
        }
      }
    }, 300);
  };

  return (
    <div className="flex flex-col border-1 border-[#41719C] rounded-md p-4">
      {keyPositionMessages.map((message) => {
        // 检查content是否为对象，如果是则转换为JSON字符串显示
        const content =
          typeof message.content === 'object'
            ? JSON.stringify(message.content)
            : message.content;
        return <div key={message.id}>{content}</div>;
      })}
      <h2 className="text-xl font-bold">演奏区域</h2>

      <div className="relative w-full overflow-x-auto mt-4 pb-4 h-[400px]">
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

          {/* 中间分隔线 - 将钢琴分为左右两半 */}
          <div
            className="absolute top-6 bottom-0 w-1 bg-purple-500 z-20"
            style={{
              left: `${(100 / whiteKeys.length) * middleKeyIndex}%`,
              height: 'calc(100% - 6px)',
            }}
          ></div>

          {/* 白键 */}
          <div className="white-keys flex h-full pt-6 relative">
            {whiteKeys.map((key, index) => {
              // 检查这个键是否被激活
              const keyInfo = Array.from(activeKeys.values()).find(
                (info) => info.keyId === key.id
              );
              const isActive = !!keyInfo;
              const hand = keyInfo?.hand || null;

              return (
                <div
                  key={key.id}
                  className={`white-key relative flex-1 border-r-2 border-t-0 border-b-2 border-l-0 border-gray-300 rounded-b-md flex items-end justify-center pb-2 cursor-pointer ${
                    index === 0 ? 'border-l-2' : ''
                  } ${
                    isActive
                      ? key.bgColor
                        ? `bg-[${key.bgColor}]`
                        : hand === 'left'
                        ? 'bg-[#4BC6FE]'
                        : 'bg-[#FCC473]'
                      : 'bg-gradient-to-b from-white to-gray-50 hover:bg-gray-50'
                  }`}
                  onClick={() => handleKeyClick(key.id)}
                >
                  <span className="absolute bottom-1 text-[10px] text-gray-400">
                    {key.midiNumber}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 黑键 */}
          <div className="black-keys absolute top-6 left-0 w-full h-[60%]">
            {blackKeys.map((blackKey) => {
              const whiteKeyWidth = 100 / whiteKeys.length;
              const whiteKeyIndex = getBlackKeyPosition(blackKey, whiteKeys);

              // 计算黑键位置：在对应白键的右侧
              const leftPosition =
                whiteKeyIndex * whiteKeyWidth + whiteKeyWidth * 0.65;

              // 检查这个键是否被激活
              const keyInfo = Array.from(activeKeys.values()).find(
                (info) => info.keyId === blackKey.id
              );
              const isActive = !!keyInfo;
              const hand = keyInfo?.hand || null;

              return (
                <div
                  key={blackKey.id}
                  className={`black-key absolute h-full cursor-pointer shadow-md ${
                    isActive
                      ? whiteKeys.find(
                          (k) => k.midiNumber === blackKey.midiNumber - 1
                        )?.bgColor || (hand === 'left' ? '#4BC6FE' : '#FCC473')
                        ? `bg-[${
                            whiteKeys.find(
                              (k) => k.midiNumber === blackKey.midiNumber - 1
                            )?.bgColor ||
                            (hand === 'left' ? '#4BC6FE' : '#FCC473')
                          }]`
                        : hand === 'left'
                        ? 'bg-[#4BC6FE]'
                        : 'bg-[#FCC473]'
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
        </div>
        {/* <Image
          src="/left-palm.svg"
          width={80}
          height={80}
          alt="左手"
          loading="eager"
          className="absolute top-[200px]"
          style={{
            left: `${
              whiteKeys.find((key) => key.midiNumber === 95)?.position || 0
            }px`,
          }}
        />
        <Image
          src="/right-palm.svg"
          width={80}
          height={80}
          alt="右手"
          loading="eager"
          className="absolute top-[200px]"
          style={{
            left: `${
              whiteKeys.find((key) => key.midiNumber === 108)?.position || 0
            }px`,
          }}
        /> */}
      </div>

      {/*<div className="flex justify-center items-center gap-64 mt-4">
        /~ 左手 ~/
        <div className="flex flex-col items-center">
          <Image
            src="/left-palm.svg"
            width={80}
            height={80}
            alt="左手"
            loading="eager"
          />
        </div>
        /~ 右手 ~/
        <div className="flex flex-col items-center">
          <Image
            src="/right-palm.svg"
            width={80}
            height={80}
            alt="右手"
            loading="eager"
          />
        </div>
      </div>*/}
    </div>
  );
}
