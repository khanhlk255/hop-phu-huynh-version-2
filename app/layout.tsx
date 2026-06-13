import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Link from "next/link";
const nunito = Nunito({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Họp Phụ Huynh",
  description: "Ứng dụng đặt lịch họp phụ huynh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${nunito.className} flex flex-col min-h-screen bg-amber-50`}>
        {/* Header */}
        <header className="bg-white shadow-[0_4px_0_rgba(0,0,0,0.05)] border-b-2 border-dashed border-gray-200 z-50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-black text-school-primary tracking-tight">Trường Tiểu học Quốc Tế</h1>
                <p className="text-xs font-bold text-school-success uppercase tracking-widest mt-0.5">Cổng đăng ký lịch họp phụ huynh</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/" className="bg-emerald-50 text-school-primary border border-emerald-100 hover:bg-emerald-100 font-semibold py-2 px-5 rounded-lg transition-colors flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Phụ Huynh
                </Link>
                <Link href="/admin" className="bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 font-semibold py-2 px-5 rounded-lg transition-colors flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Ban Quản Trị
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-school-primary text-white py-12 mt-auto border-t-[8px] border-school-accent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-lg font-black text-school-accent uppercase tracking-widest">
              Hệ thống đăng ký họp phụ huynh - Trường Tiểu học Quốc Tế
            </h2>
            <p className="text-emerald-100/80 text-sm max-w-2xl mx-auto leading-relaxed">
              Nền tảng sắp xếp lịch trình tối giản, lưu trữ và mã hóa trong trình duyệt giúp điểm danh nhanh và giảm ùn tắc phòng họp.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
