'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGroupBuyPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    maxCount: '',
    deadline: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('http://localhost:3000/api/organizer_groupbuys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          status: '進行中',
          current_count: 0,
          max_count: parseInt(form.maxCount),
          deadline: new Date(form.deadline), 
          created_at: new Date(), 
        }),
      });
  
      if (!res.ok) throw new Error('新增失敗');
  
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
          <label className="block font-medium">團購名稱</label>
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
          <label className="block font-medium">團購描述</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={3}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">團購價格</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          
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
