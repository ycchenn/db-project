'use client';

import { useState } from 'react';
import Link from 'next/link';

type GroupBuy = {
  id: number;
  title: string;
  status: '進行中' | '已成團' | '未成團' | '已關閉';
  currentCount: number;
  maxCount: number;
  deadline: string;
};

const mockData: GroupBuy[] = [
  {
    id: 1,
    title: '韓國保溫杯團購',
    status: '進行中',
    currentCount: 18,
    maxCount: 30,
    deadline: '2025-06-01',
  },
  {
    id: 2,
    title: '日本文具開團',
    status: '已成團',
    currentCount: 50,
    maxCount: 50,
    deadline: '2025-05-10',
  },
  {
    id: 3,
    title: '兒童玩具優惠組',
    status: '未成團',
    currentCount: 2,
    maxCount: 20,
    deadline: '2025-05-30',
  },
];

export default function GroupBuyPage() {
  const [data, setData] = useState<GroupBuy[]>(mockData);

  return (
    <div className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">我的團購清單</h1>
      <Link
        href="/groupbuy/create"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ＋新增團購
      </Link>
    </div>
      
      <table className="w-full table-auto border text-sm bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">團購名稱</th>
            <th className="px-4 py-2 text-left">狀態</th>
            <th className="px-4 py-2 text-left">目前人數</th>
            <th className="px-4 py-2 text-left">截止日</th>
            <th className="px-4 py-2 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{item.title}</td>
              <td className="px-4 py-2">{item.status}</td>
              <td className="px-4 py-2">
                {item.currentCount} / {item.maxCount}
              </td>
              <td className="px-4 py-2">{item.deadline}</td>
              <td className="px-4 py-2">
                <Link
                  href={`/groupbuy/${item.id}`}
                  className="text-blue-600 hover:underline mr-2"
                >
                  查看
                </Link>
                <button className="text-green-600 hover:underline mr-2">編輯</button>
                <button className="text-red-600 hover:underline">關閉</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
