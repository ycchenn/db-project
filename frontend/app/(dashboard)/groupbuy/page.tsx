'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type GroupBuy = {
  id: number;
  title: string;
  description: string;
  price: number;
  status: '進行中' | '已成團' | '未成團' | '已關閉';
  current_count: number;
  max_count: number;
  deadline: string;
  image_url?: string;
};

export default function GroupBuyPage() {
  const [data, setData] = useState<GroupBuy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user_id = localStorage.getItem('userId'); // ✅ 用 localStorage 模擬登入
    /*if (!user_id) {
      alert('請先登入');
      return;
    }*/

    fetch(`http://localhost:3000/api/groupbuys?user_id=${user_id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API 錯誤 (${res.status})`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('無法載入資料:', err);
        setLoading(false);
      });
  }, []);

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

      {loading ? (
        <p>載入中...</p>
      ) : (
        <table className="w-full table-auto border text-sm bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">商品圖片</th>
              <th className="px-4 py-2 text-left">商品名稱</th>
              <th className="px-4 py-2 text-left">商品描述</th>
              <th className="px-4 py-2 text-left">價錢</th>
              <th className="px-4 py-2 text-left">狀態</th>
              <th className="px-4 py-2 text-left">目前人數</th>
              <th className="px-4 py-2 text-left">截止日</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-14 h-14 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400">無圖</span>
                  )}
                </td>
                <td className="px-4 py-2">{item.title}</td>
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2">${item.price}</td>
                <td className="px-4 py-2">{item.status}</td>
                <td className="px-4 py-2">
                  {item.current_count} / {item.max_count}
                </td>
                <td className="px-4 py-2">
                  {new Date(item.deadline).toISOString().split('T')[0]}
                </td>
                <td className="px-4 py-2">
                  <Link
                    href={`/groupbuy/${item.id}/edit`}
                    className="text-green-600 hover:underline"
                  >
                    編輯
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
