import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: '團購系統',
  description: '一個簡單易用的團購平台，支援多人團購、購物車管理和訂單追蹤',
  icons: {
    icon: '/favicon.svg', // 指向 SVG 檔案
  },
};


export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      <Analytics />
    </html>
  );
}
