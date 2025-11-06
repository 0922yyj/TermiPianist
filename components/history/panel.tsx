import { useState } from 'react';
import { Select } from '@/components/ui/select';
// 获取路由
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function HistoryPanel() {
  const router = useRouter();
  const pathname = usePathname();

  const [userSelectedMode, setUserSelectedMode] = useState('');
  // 根据当前路径计算当前模式（派生状态）
  const currentMode = pathname === '/learn' ? 'learn' : 'perform';
  // 实际使用的模式：如果用户手动选择了模式，则使用用户选择的；否则使用基于路径的模式
  const mode = userSelectedMode || currentMode;

  const performLogs = [
    {
      id: 1,
      time: '2025-01-01',
      name: '小星星',
      status: '已完成',
      result: '成功',
    },
    {
      id: 2,
      time: '2025-01-02',
      name: '小星星2',
      status: '进行中',
      result: '失败',
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between w-full text-black">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1>当前已演奏曲目:</h1>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {performLogs.map((item, index) => (
            <li key={index} className="flex gap-2">
              <div>{index + 1}.</div>
              <div>
                <div>
                  <span className="mr-3">{item.name}</span>
                  <span>{item.time}</span>
                </div>
                <div>
                  <span className="mr-3">{item.status}</span>
                  <span>{item.result}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Select
          value={mode}
          onChange={(e) => {
            setUserSelectedMode(e.target.value);
            // 根据选择的模式跳转到对应页面
            if (e.target.value === 'perform') {
              router.push('/perform');
            } else if (e.target.value === 'learn') {
              router.push('/learn');
            }
          }}
          options={[
            { value: 'perform', label: '演奏模式' },
            { value: 'learn', label: '学习模式' },
          ]}
          className="w-[180px]"
          placeholder="选择模式"
        />
      </div>
    </div>
  );
}
