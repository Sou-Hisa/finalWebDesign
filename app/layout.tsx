import type { Metadata } from "next";
import { Ma_Shan_Zheng, Noto_Serif_TC, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const maShangZheng = Ma_Shan_Zheng({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "逃離糖果屋",
  description: "一個黑暗童話密室逃脫遊戲",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`h-full antialiased ${maShangZheng.variable} ${notoSerifTC.variable} ${notoSansTC.variable}`}
    >
      <body className="w-full h-screen min-h-full flex flex-col font-ui">
        {children}
      </body>
    </html>
  );
}
