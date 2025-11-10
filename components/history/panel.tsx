import { useEffect, useState } from 'react';
import { Select } from '@/components/ui/select';
// 获取路由
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Loader } from 'lucide-react';

// 定义演奏历史记录类型
interface PerformHistoryItem {
  id: string;
  pieceId: string;
  pieceName: string;
  composer: string;
  startedAt: string;
  endedAt: string | null;
  durationSec: number | null;
  status: 'ended' | string;
  success: boolean;
}

export default function HistoryPanel() {
  const router = useRouter();
  const pathname = usePathname();

  const [userSelectedMode, setUserSelectedMode] = useState('');
  // 根据当前路径计算当前模式（派生状态）
  const currentMode = pathname === '/learn' ? 'learn' : 'perform';
  // 实际使用的模式：如果用户手动选择了模式，则使用用户选择的；否则使用基于路径的模式
  const mode = userSelectedMode || currentMode;

  const [performHistory, setPerformHistory] = useState<PerformHistoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  console.log('mode:', mode);
  useEffect(() => {
    fetch(`/api/history`)
      .then((res) => res.json())
      .then((data) => {
        console.log('history:', data);
        setPerformHistory(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch /history:', err);
        setIsLoading(false);
      });
  }, []);
  return (
    <div className="flex h-full flex-col justify-between w-full text-black">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1>当前已演奏曲目:</h1>
        </div>
        {isLoading ? (
          <div className="mt-8 text-center">
            <Loader className="inline-block h-6 w-6 animate-spin text-gray-500" />
            <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : performHistory.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
            {performHistory.map((item, index) => (
              <li key={item.id} className="flex gap-2">
                <div>{index + 1}.</div>
                <div>
                  <div>
                    <span className="mr-3">{item.pieceName}</span>
                    <span>{new Date(item.startedAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="mr-3">{item.status}</span>
                    <span>{item.success ? '成功' : '失败'}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 text-center text-gray-500">
            <p>暂无演奏记录</p>
          </div>
        )}
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
