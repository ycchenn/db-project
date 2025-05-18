'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGroupBuyPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
    maxCount: '',
    deadline: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const res = await fetch('http://localhost:3000/api/groupbuys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // ✅ 預設填入
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          image_url: '', // ✅ 如果還沒上傳功能，可放預設圖片
          max_count: parseInt(form.maxCount),
          deadline: form.deadline,
        }),
      });
  
      if (!res.ok) throw new Error('新增失敗');
      const errorText = await res.text();
  
      alert('團購新增成功！');
      router.push('/groupbuy');
    } catch (err) {
      console.error('❌ 發生錯誤:', err);
      alert('❌ 發生錯誤，請稍後再試');
    }
  };
  

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">新增團購</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">商品名稱 / 團購標題</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">商品描述</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block font-medium">商品圖片網址</label>
          <input
            type="text"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block font-medium">價格</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">人數上限</label>
          <input
            type="number"
            name="maxCount"
            value={form.maxCount}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">截止日期</label>
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          建立團購
        </button>
      </form>
    </div>
  );
}