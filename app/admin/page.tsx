'use client';

import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logoutAdmin } from './actions';

export default function AdminDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [filterLop, setFilterLop] = useState("Tất cả");
  const [filterNgay, setFilterNgay] = useState("Tất cả");

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    });

    const unsubAppointments = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
      setIsLoading(false);
    });

    return () => {
      unsubStudents();
      unsubAppointments();
    };
  }, []);

  // Update attendance
  const updateAttendanceStatus = async (id: string, newStatus: string) => {
    try {
      const aptRef = doc(db, "appointments", id);
      await updateDoc(aptRef, { trang_thai_tham_gia: newStatus });
    } catch (error) {
      console.error("Lỗi cập nhật điểm danh:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  // 1. Thống kê tổng quan
  const totalStudents = students.length;
  const bookedAppointments = appointments.filter(a => a.trang_thai === 'đã đặt' && a.ten_hoc_sinh);
  
  const uniqueBookedStudents = new Set(bookedAppointments.map(a => `${a.ten_hoc_sinh}-${a.lop}`));
  const bookedCount = uniqueBookedStudents.size;
  const bookingRate = totalStudents > 0 ? ((bookedCount / totalStudents) * 100).toFixed(1) : 0;

  // 2. Thống kê Điểm Danh
  let attendedCount = 0;
  let notAttendedCount = 0;
  let rescheduledCount = 0;

  bookedAppointments.forEach(apt => {
    const status = apt.trang_thai_tham_gia || 'Chưa rõ';
    if (status === 'Đã tham gia') attendedCount++;
    if (status === 'Không đến') notAttendedCount++;
    if (status === 'Đổi lịch') rescheduledCount++;
  });

  // 3. Lọc danh sách cho bảng
  let filteredAppts = bookedAppointments;
  if (filterLop !== "Tất cả") {
    filteredAppts = filteredAppts.filter(a => a.lop === filterLop);
  }
  if (filterNgay !== "Tất cả") {
    filteredAppts = filteredAppts.filter(a => a.ngay_hop === filterNgay);
  }

  const sortedBookedAppts = [...filteredAppts].sort((a, b) => {
    if (a.ngay_hop !== b.ngay_hop) return a.ngay_hop.localeCompare(b.ngay_hop);
    if (a.gio_hop !== b.gio_hop) return a.gio_hop.localeCompare(b.gio_hop);
    return 0;
  });

  // Helper để lấy class màu cho select
  const getSelectColorClass = (status: string) => {
    switch(status) {
      case 'Đã tham gia': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Không đến': return 'bg-red-100 text-red-800 border-red-200';
      case 'Đổi lịch': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-[#1E3A8A] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center font-bold">AD</div>
            <h1 className="text-xl font-bold tracking-wide">QUẢN TRỊ HỆ THỐNG</h1>
          </div>
          
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              ĐĂNG XUẤT
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* --- KHU VỰC 1: TỔNG QUAN --- */}
        <section>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Tổng Quan Chiến Dịch Đăng Ký</h2>
            <p className="text-slate-500 mt-1">Dữ liệu được cập nhật theo thời gian thực (Real-time)</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse mt-6">
              {[1, 2, 3].map(i => <div key={i} className="bg-white h-32 rounded-2xl border border-slate-200 shadow-sm"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between border-l-4 border-l-blue-500">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tổng số học sinh</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-800">{totalStudents}</span>
                  <span className="text-slate-400 font-medium">bé</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between border-l-4 border-l-blue-500">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Đã đặt lịch</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-blue-600">{bookedCount}</span>
                  <span className="text-slate-400 font-medium">phụ huynh</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between border-l-4 border-l-purple-500">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tỉ lệ hoàn thành</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-purple-600">{bookingRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${bookingRate}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* --- KHU VỰC 2: BÁO CÁO ĐIỂM DANH --- */}
        <section>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Báo Cáo Điểm Danh Thực Tế</h2>
            <p className="text-slate-500 mt-1">Quản lý người tham gia trực tiếp tại sự kiện</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse mt-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="bg-white h-24 rounded-2xl border border-slate-200 shadow-sm"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng lịch hẹn</span>
                <span className="text-3xl font-black text-slate-700">{bookedAppointments.length}</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center text-emerald-800">
                <span className="text-xs font-bold uppercase tracking-wider mb-1">Đã tham gia</span>
                <span className="text-3xl font-black">{attendedCount}</span>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm flex flex-col items-center justify-center text-red-800">
                <span className="text-xs font-bold uppercase tracking-wider mb-1">Không đến</span>
                <span className="text-3xl font-black">{notAttendedCount}</span>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm flex flex-col items-center justify-center text-orange-800">
                <span className="text-xs font-bold uppercase tracking-wider mb-1">Đổi lịch</span>
                <span className="text-3xl font-black">{rescheduledCount}</span>
              </div>
            </div>
          )}
        </section>

        {/* --- KHU VỰC 3: BẢNG DỮ LIỆU & BỘ LỌC --- */}
        <section>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Toolbar Bộ Lọc */}
            <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap gap-4 items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Danh Sách Phụ Huynh Đã Đặt Lịch</h3>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-500">Lớp:</span>
                  <select 
                    value={filterLop} 
                    onChange={(e) => setFilterLop(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                  >
                    <option value="Tất cả">Tất cả các lớp</option>
                    <option value="Lớp 1">Lớp 1</option>
                    <option value="Lớp 2">Lớp 2</option>
                    <option value="Lớp 3">Lớp 3</option>
                    <option value="Lớp 4">Lớp 4</option>
                    <option value="Lớp 5">Lớp 5</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-500">Ngày:</span>
                  <select 
                    value={filterNgay} 
                    onChange={(e) => setFilterNgay(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                  >
                    <option value="Tất cả">Tất cả các ngày</option>
                    <option value="22/6">22/6</option>
                    <option value="23/6">23/6</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Bảng */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-4 w-12 text-center">STT</th>
                    <th className="p-4">Học sinh</th>
                    <th className="p-4">Lớp</th>
                    <th className="p-4">Lịch họp</th>
                    <th className="p-4">Tham dự</th>
                    <th className="p-4">Ghi chú</th>
                    <th className="p-4 text-center w-40">Trạng Thái (Điểm Danh)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400 animate-pulse">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : sortedBookedAppts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400 italic">
                        Không có lịch hẹn nào khớp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    sortedBookedAppts.map((apt, index) => {
                      const currentStatus = apt.trang_thai_tham_gia || 'Chưa rõ';
                      const selectColor = getSelectColorClass(currentStatus);

                      return (
                        <tr key={apt.id} className="even:bg-slate-50 hover:bg-indigo-50/50 transition-colors">
                          <td className="p-4 text-center font-medium text-slate-500">{index + 1}</td>
                          <td className="p-4 font-bold text-slate-800">{apt.ten_hoc_sinh}</td>
                          <td className="p-4 font-semibold text-indigo-600">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                              {apt.lop}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700">{apt.gio_hop}</span>
                              <span className="text-xs text-slate-500 font-medium">Ngày {apt.ngay_hop}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-700 font-medium text-sm">{apt.nguoi_tham_du || '-'}</td>
                          <td className="p-4 text-slate-500 text-xs max-w-[150px] truncate" title={apt.ghi_chu}>
                            {apt.ghi_chu || <span className="italic opacity-50">Không có</span>}
                          </td>
                          <td className="p-4 text-center">
                            <select 
                              value={currentStatus}
                              onChange={(e) => updateAttendanceStatus(apt.id, e.target.value)}
                              className={`text-xs font-bold px-3 py-2 rounded-lg border outline-none cursor-pointer transition-colors w-full text-center appearance-none ${selectColor}`}
                            >
                              <option value="Chưa rõ">Chưa rõ</option>
                              <option value="Đã tham gia">Đã tham gia</option>
                              <option value="Không đến">Không đến</option>
                              <option value="Đổi lịch">Đổi lịch</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
              <span className="text-sm font-semibold text-slate-600">
                Hiển thị {sortedBookedAppts.length} lịch hẹn
              </span>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
