import { SimpleModal } from '@/components/ui/simple-modal';
import { useEffect, useState } from 'react';

export function ExpiredGroupbuyReminder() {
  const [show, setShow] = useState(false);
  const [expiredGroups, setExpiredGroups] = useState<any[]>([]);

  useEffect(() => {
    // 讀取 orderHistory，找出已截止且有未付款訂單的團購
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const now = new Date();
    const expiredUnpaidGroups: any[] = [];
    orderHistory.forEach((order: any) => {
      if (Array.isArray(order.items) && order.items.length > 0 && Array.isArray(order.groupBuys)) {
        order.groupBuys.forEach((gb: any) => {
          if (gb.deadline && new Date(gb.deadline) < now) {
            // 只抓這個團購下你未付款的商品
            const unpaidItems = order.items.filter(
              (item: any) =>
                String(item.group_buy_id) === String(gb.groupId) &&
                (item.paid === 0 || item.paid === false || item.paid === "0")
            );
            if (unpaidItems.length > 0) {
              expiredUnpaidGroups.push({
                ...gb,
                unpaidItems: unpaidItems
              });
            }
          }
        });
      }
    });
    if (expiredUnpaidGroups.length > 0) {
      setExpiredGroups(expiredUnpaidGroups);
      setShow(true);
    }
  }, []);

  if (!show || expiredGroups.length === 0) return null;
  return (
    <SimpleModal open={show} onClose={() => setShow(false)} title="團購截止未付款提醒">
      <div>
        您參加的以下團購已截止，且有未付款商品：
        <ul className="list-disc pl-5 mt-2">
          {expiredGroups.map((g, i) => (
            <li key={g.groupId || i}>
              {g.owner ? `${g.owner} 的團購` : ''}（截止日：{new Date(g.deadline).toLocaleDateString()}）
              <ul className="list-disc pl-5 text-sm text-red-600">
                {g.unpaidItems?.map((item: any, idx: number) => (
                  <li key={item.id || idx}>{item.name}（數量：{item.quantity}）尚未付款</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </SimpleModal>
  );
}
