'use client';

// 定义键盘按键类型
export type WhiteKey = {
  note: string;
  id: string;
  label: string;
  midiNumber: number;
  position?: number;
  bgColor?: string;
};

export type BlackKey = {
  note: string;
  id: string;
  afterWhiteKey: string;
  midiNumber: number;
  position?: number;
};

// 生成钢琴键盘数据
export function generatePianoKeys() {
  // 构建白键数组 - 从A0到C8，带MIDI编号
  const whiteKeys: WhiteKey[] = [];

  // 第一个八度：A0(21), B0(23)
  whiteKeys.push({
    note: 'A',
    id: 'A0',
    label: 'A',
    midiNumber: 21,
    position: 0,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'B',
    id: 'B0',
    label: 'B',
    midiNumber: 23,
    position: 32,
    bgColor: '#4BC6FE',
  });

  // 七个完整八度：C1-B7
  // C1(24), D1(26), E1(28), F1(29), G1(31), A1(33), B1(35)
  whiteKeys.push({
    note: 'C',
    id: 'C1',
    label: 'C',
    midiNumber: 24,
    position: 62,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'D',
    id: 'D1',
    label: 'D',
    midiNumber: 26,
    position: 92,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'E',
    id: 'E1',
    label: 'E',
    midiNumber: 28,
    position: 122,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'F',
    id: 'F1',
    label: 'F',
    midiNumber: 29,
    position: 152,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'G',
    id: 'G1',
    label: 'G',
    midiNumber: 31,
    position: 182,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'A',
    id: 'A1',
    label: 'A',
    midiNumber: 33,
    position: 212,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'B',
    id: 'B1',
    label: 'B',
    midiNumber: 35,
    position: 242,
    bgColor: '#4BC6FE',
  });

  // C2(36), D2(38), E2(40), F2(41), G2(43), A2(45), B2(47)
  whiteKeys.push({
    note: 'C',
    id: 'C2',
    label: 'C',
    midiNumber: 36,
    position: 182,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'D',
    id: 'D2',
    label: 'D',
    midiNumber: 38,
    position: 212,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'E',
    id: 'E2',
    label: 'E',
    midiNumber: 40,
    position: 242,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'F',
    id: 'F2',
    label: 'F',
    midiNumber: 41,
    position: 272,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'G',
    id: 'G2',
    label: 'G',
    midiNumber: 43,
    position: 302,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'A',
    id: 'A2',
    label: 'A',
    midiNumber: 45,
    position: 332,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'B',
    id: 'B2',
    label: 'B',
    midiNumber: 47,
    position: 362,
    bgColor: '#4BC6FE',
  });

  // C3(48), D3(50), E3(52), F3(53), G3(55), A3(57), B3(59)
  whiteKeys.push({
    note: 'C',
    id: 'C3',
    label: 'C',
    midiNumber: 48,
    position: 392,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'D',
    id: 'D3',
    label: 'D',
    midiNumber: 50,
    position: 422,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'E',
    id: 'E3',
    label: 'E',
    midiNumber: 52,
    position: 452,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'F',
    id: 'F3',
    label: 'F',
    midiNumber: 53,
    position: 482,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'G',
    id: 'G3',
    label: 'G',
    midiNumber: 55,
    position: 512,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'A',
    id: 'A3',
    label: 'A',
    midiNumber: 57,
    position: 542,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'B',
    id: 'B3',
    label: 'B',
    midiNumber: 59,
    position: 572,
    bgColor: '#4BC6FE',
  });

  // C4(60), D4(62), E4(64), F4(65), G4(67), A4(69), B4(71)
  whiteKeys.push({
    note: 'C',
    id: 'C4',
    label: 'C',
    midiNumber: 60,
    position: 572,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'D',
    id: 'D4',
    label: 'D',
    midiNumber: 62,
    position: 602,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'E',
    id: 'E4',
    label: 'E',
    midiNumber: 64,
    position: 632,
    bgColor: '#4BC6FE',
  });
  whiteKeys.push({
    note: 'F',
    id: 'F4',
    label: 'F',
    midiNumber: 65,
    position: 662,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'G',
    id: 'G4',
    label: 'G',
    midiNumber: 67,
    position: 692,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'A',
    id: 'A4',
    label: 'A',
    midiNumber: 69,
    position: 722,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'B',
    id: 'B4',
    label: 'B',
    midiNumber: 71,
    position: 752,
    bgColor: '#FCC473',
  });

  // C5(72), D5(74), E5(76), F5(77), G5(79), A5(81), B5(83)
  whiteKeys.push({
    note: 'C',
    id: 'C5',
    label: 'C',
    midiNumber: 72,
    position: 782,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'D',
    id: 'D5',
    label: 'D',
    midiNumber: 74,
    position: 812,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'E',
    id: 'E5',
    label: 'E',
    midiNumber: 76,
    position: 842,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'F',
    id: 'F5',
    label: 'F',
    midiNumber: 77,
    position: 842,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'G',
    id: 'G5',
    label: 'G',
    midiNumber: 79,
    position: 872,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'A',
    id: 'A5',
    label: 'A',
    midiNumber: 81,
    position: 902,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'B',
    id: 'B5',
    label: 'B',
    midiNumber: 83,
    position: 932,
    bgColor: '#FCC473',
  });

  // C6(84), D6(86), E6(88), F6(89), G6(91), A6(93), B6(95)
  whiteKeys.push({
    note: 'C',
    id: 'C6',
    label: 'C',
    midiNumber: 84,
    position: 962,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'D',
    id: 'D6',
    label: 'D',
    midiNumber: 86,
    position: 992,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'E',
    id: 'E6',
    label: 'E',
    midiNumber: 88,
    position: 1022,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'F',
    id: 'F6',
    label: 'F',
    midiNumber: 89,
    position: 1022,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'G',
    id: 'G6',
    label: 'G',
    midiNumber: 91,
    position: 1052,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'A',
    id: 'A6',
    label: 'A',
    midiNumber: 93,
    position: 1082,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'B',
    id: 'B6',
    label: 'B',
    midiNumber: 95,
    position: 1112,
    bgColor: '#FCC473',
  });

  // C7(96), D7(98), E7(100), F7(101), G7(103), A7(105), B7(107)
  whiteKeys.push({
    note: 'C',
    id: 'C7',
    label: 'C',
    midiNumber: 96,
    position: 1142,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'D',
    id: 'D7',
    label: 'D',
    midiNumber: 98,
    position: 1172,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'E',
    id: 'E7',
    label: 'E',
    midiNumber: 100,
    position: 1202,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'F',
    id: 'F7',
    label: 'F',
    midiNumber: 101,
    position: 1232,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'G',
    id: 'G7',
    label: 'G',
    midiNumber: 103,
    position: 1262,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'A',
    id: 'A7',
    label: 'A',
    midiNumber: 105,
    position: 1292,
    bgColor: '#FCC473',
  });
  whiteKeys.push({
    note: 'B',
    id: 'B7',
    label: 'B',
    midiNumber: 107,
    position: 1322,
    bgColor: '#FCC473',
  });

  // 最后一个音符：C8(108)
  whiteKeys.push({
    note: 'C',
    id: 'C8',
    label: 'C',
    midiNumber: 108,
    position: 1352,
    bgColor: '#FCC473',
  });

  // 构建黑键数组 - 带MIDI编号
  const blackKeys: BlackKey[] = [];

  // 第一组AB之间的黑键
  blackKeys.push({
    note: 'A#',
    id: 'A#0',
    afterWhiteKey: 'A0',
    midiNumber: 22,
  });

  // 按照规律：CDE之间有2个黑键，FGAB之间有3个黑键
  // 第一个八度
  blackKeys.push({
    note: 'C#',
    id: 'C#1',
    afterWhiteKey: 'C1',
    midiNumber: 25,
  });
  blackKeys.push({
    note: 'D#',
    id: 'D#1',
    afterWhiteKey: 'D1',
    midiNumber: 27,
  });
  blackKeys.push({
    note: 'F#',
    id: 'F#1',
    afterWhiteKey: 'F1',
    midiNumber: 30,
  });
  blackKeys.push({
    note: 'G#',
    id: 'G#1',
    afterWhiteKey: 'G1',
    midiNumber: 32,
  });
  blackKeys.push({
    note: 'A#',
    id: 'A#1',
    afterWhiteKey: 'A1',
    midiNumber: 34,
  });

  // 第二个八度
  blackKeys.push({
    note: 'C#',
    id: 'C#2',
    afterWhiteKey: 'C2',
    midiNumber: 37,
  });
  blackKeys.push({
    note: 'D#',
    id: 'D#2',
    afterWhiteKey: 'D2',
    midiNumber: 39,
  });
  blackKeys.push({
    note: 'F#',
    id: 'F#2',
    afterWhiteKey: 'F2',
    midiNumber: 42,
  });
  blackKeys.push({
    note: 'G#',
    id: 'G#2',
    afterWhiteKey: 'G2',
    midiNumber: 44,
  });
  blackKeys.push({
    note: 'A#',
    id: 'A#2',
    afterWhiteKey: 'A2',
    midiNumber: 46,
  });

  // 第三个八度
  blackKeys.push({
    note: 'C#',
    id: 'C#3',
    afterWhiteKey: 'C3',
    midiNumber: 49,
  });
  blackKeys.push({
    note: 'D#',
    id: 'D#3',
    afterWhiteKey: 'D3',
    midiNumber: 51,
  });
  blackKeys.push({
    note: 'F#',
    id: 'F#3',
    afterWhiteKey: 'F3',
    midiNumber: 54,
  });
  blackKeys.push({
    note: 'G#',
    id: 'G#3',
    afterWhiteKey: 'G3',
    midiNumber: 56,
  });
  blackKeys.push({
    note: 'A#',
    id: 'A#3',
    afterWhiteKey: 'A3',
    midiNumber: 58,
  });

  // 第四个八度
  blackKeys.push({
    note: 'C#',
    id: 'C#4',
    afterWhiteKey: 'C4',
    midiNumber: 61,
  });
  blackKeys.push({
    note: 'D#',
    id: 'D#4',
    afterWhiteKey: 'D4',
    midiNumber: 63,
  });
  blackKeys.push({
    note: 'F#',
    id: 'F#4',
    afterWhiteKey: 'F4',
    midiNumber: 66,
  });
  blackKeys.push({
    note: 'G#',
    id: 'G#4',
    afterWhiteKey: 'G4',
    midiNumber: 68,
  });
  blackKeys.push({
    note: 'A#',
    id: 'A#4',
    afterWhiteKey: 'A4',
    midiNumber: 70,
  });

  // 第五个八度
  blackKeys.push({
    note: 'C#',
    id: 'C#5',
    afterWhiteKey: 'C5',
    midiNumber: 73,
  });
  blackKeys.push({
    note: 'D#',
    id: 'D#5',
    afterWhiteKey: 'D5',
    midiNumber: 75,
  });
  blackKeys.push({
    note: 'F#',
    id: 'F#5',
    afterWhiteKey: 'F5',
    midiNumber: 78,
  });
  blackKeys.push({
    note: 'G#',
    id: 'G#5',
    afterWhiteKey: 'G5',
    midiNumber: 80,
  });
  blackKeys.push({
    note: 'A#',
    id: 'A#5',
    afterWhiteKey: 'A5',
    midiNumber: 82,
  });

  // 第六个八度
  blackKeys.push({
    note: 'C#',
    id: 'C#6',
    afterWhiteKey: 'C6',
    midiNumber: 85,
  });
  blackKeys.push({
    note: 'D#',
    id: 'D#6',
    afterWhiteKey: 'D6',
    midiNumber: 87,
  });
  blackKeys.push({
    note: 'F#',
    id: 'F#6',
    afterWhiteKey: 'F6',
    midiNumber: 90,
  });
  blackKeys.push({
    note: 'G#',
    id: 'G#6',
    afterWhiteKey: 'G6',
    midiNumber: 92,
  });
  blackKeys.push({
    note: 'A#',
    id: 'A#6',
    afterWhiteKey: 'A6',
    midiNumber: 94,
  });

  // 第七个八度
  blackKeys.push({
    note: 'C#',
    id: 'C#7',
    afterWhiteKey: 'C7',
    midiNumber: 97,
  });
  blackKeys.push({
    note: 'D#',
    id: 'D#7',
    afterWhiteKey: 'D7',
    midiNumber: 99,
  });
  blackKeys.push({
    note: 'F#',
    id: 'F#7',
    afterWhiteKey: 'F7',
    midiNumber: 102,
  });
  blackKeys.push({
    note: 'G#',
    id: 'G#7',
    afterWhiteKey: 'G7',
    midiNumber: 104,
  });
  blackKeys.push({
    note: 'A#',
    id: 'A#7',
    afterWhiteKey: 'A7',
    midiNumber: 106,
  });

  return { whiteKeys, blackKeys };
}

// 计算黑键位置的辅助函数
export function getBlackKeyPosition(blackKey: BlackKey, whiteKeys: WhiteKey[]) {
  const whiteKeyIndex = whiteKeys.findIndex(
    (k) => k.id === blackKey.afterWhiteKey
  );
  if (whiteKeyIndex === -1) return 0;
  return whiteKeyIndex;
}
