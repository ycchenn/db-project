'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditGroupBuyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    maxCount: '',
    currentCount: '',
    deadline: '',
    status: '進行中',
  });

  useEffect(() => {
    fetch(`http://localhost:3000/api/organizer_groupbuys/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          title: data.title ?? '',
          description: data.description ?? '',
          price: data.price?.toString() ?? '',
          originalPrice: data.original_price?.toString() ?? '',
          maxCount: data.max_count?.toString() ?? '',
          currentCount: data.current_count?.toString() ?? '',
          status: data.status ?? '',
          deadline: data.deadline?.slice(0, 10) ?? '',
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('無法載入團購資料', err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    console.log(`[變更] ${name} =`, value); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('傳送表單:', form);

    try {
      const res = await fetch(`http://localhost:3000/api/organizer_groupbuys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          status: form.status,
          maxCount: parseInt(form.maxCount),
          currentCount: parseInt(form.currentCount),
          deadline: form.deadline,
        }),
      });
  
      if (res.ok) {
        alert('更新成功！');
        router.push('/groupbuy');
      } else {
        console.error('❌ 更新失敗:', await res.text());
        alert('更新失敗');
      }
    } catch (err) {
      console.error('❌ 發送錯誤:', err);
      alert('無法連線到伺服器');
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除這個團購嗎？')) return;
    const res = await fetch(`http://localhost:3000/api/organizer_groupbuys/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      alert('已刪除');
      router.push('/groupbuy');
    } else {
      alert('刪除失敗');
    }
  };

  const handleClose = async () => {
    const res = await fetch(`http://localhost:3000/api/organizer_groupbuys/${id}/close`, {
      method: 'POST',
    });
    if (res.ok) {
      alert('已關閉團購');
      router.push('/groupbuy');
    } else {
      alert('關閉失敗');
    }
  };

  if (loading) return <div className="p-6">載入中...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">編輯團購</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label className="block font-medium mb-1">商品名稱</label>
    <input
      name="title"
      value={form.title}
      onChange={handleChange}
      className="w-full border p-2 rounded"
    />
  </div>
  <div>
    <label className="block font-medium mb-1">商品描述</label>
    <input
      name="description"
      value={form.description}
      onChange={handleChange}
      className="w-full border p-2 rounded"
    />
  </div>
  <div>
    <label className="block font-medium mb-1">團購價格</label>
    <input
      type="number"
      name="price"
      value={form.price}
      onChange={handleChange}
      className="w-full border p-2 rounded"
    />
  </div>
  
  <div>
    <label className="block font-medium mb-1">人數上限</label>
    <input
      type="number"
      name="maxCount"
      value={form.maxCount}
      onChange={handleChange}
      className="w-full border p-2 rounded"
    />
  </div>

  <div>
    <label className="block font-medium">目前人數</label>
    <input
    type="number"
    name="currentCount"
    value={form.currentCount}
    onChange={handleChange}
    required
    className="w-full border px-3 py-2 rounded"
    />
  </div>


  <div>
  <label className="block font-medium mb-1">團購狀態</label>
  <select
    name="status"
    value={form.status}
    onChange={(e) => setForm({ ...form, status: e.target.value })}
    className="w-full border p-2 rounded"
  >
    <option value="進行中">進行中</option>
    <option value="已成團">已成團</option>
    <option value="未成團">未成團</option>
    <option value="已關閉">已關閉</option>
  </select>
  </div>

  <div>
    <label className="block font-medium mb-1">截止日期</label>
    <input
      type="date"
      name="deadline"
      value={form.deadline}
      onChange={handleChange}
      className="w-full border p-2 rounded"
    />
  </div>

  <div className="flex gap-2">
    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      儲存變更
    </button>
    
    <button
      type="button"
      onClick={handleDelete}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      刪除團購
    </button>
  </div>
</form>

    </div>
  );
}
