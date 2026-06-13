'use client';

import React, { useState, useEffect } from 'react';
// Thay đổi import này để sử dụng đường dẫn tương đối ổn định nhất
import { db } from './firebase';
import { collection, onSnapshot, query, where, updateDoc, doc, getDocs } from 'firebase/firestore';
import { Star, Sun, Pencil, Book, Send, Calendar } from 'lucide-react';

export default function Home() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [studentName, setStudentName] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [parentName, setParentName] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'appointments'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    });
    return () => unsub();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where("ten_hoc_sinh", "==", studentName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setSelectedStudent(querySnapshot.docs[0].data());
    } else {
      alert("Không tìm thấy bé, mẹ kiểm tra lại tên nhé!");
    }
  };

  const handleBook = async () => {
    if (!selectedSlot || !parentName) return alert("Mẹ điền đủ thông tin giúp cô nhé!");
    try {
      await updateDoc(doc(db, 'appointments', selectedSlot.id), {
        trang_thai: 'đã đặt',
        ten_hoc_sinh: selectedStudent.ten_hoc_sinh,
        nguoi_tham_du: parentName,
        ghi_chu: note
      });
      setSuccess(true);
    } catch (e) {
      alert("Có lỗi nhỏ, mẹ thử lại nhé!");
    }
  };

  if (success) return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl border-4 border-[#A3E635] shadow-xl text-center">
        <Star className="w-16 h-16 text-[#FBBF24] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#0A3D91] mb-2">Đăng ký thành công!</h2>
        <p className="text-gray-600">Cô đã nhận được lịch của bé {selectedStudent?.ten_hoc_sinh}. Hẹn gặp Ba Mẹ tại trường nhé!</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <header className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-black text-[#0A3D91] mb-4">Hành Trình Khôn Lớn Của Con 🌟</h1>
        <p className="text-gray-600">Chào Ba Mẹ, một năm học nữa lại trôi qua với biết bao tiếng cười. Đây là khoảnh khắc tuyệt vời để Ba Mẹ và Nhà trường cùng nhìn lại chặng đường con đã đi qua. Mẹ hãy chọn khung giờ phù hợp để trò chuyện cùng Cô giáo chủ nhiệm nhé!</p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border-2 border-[#A3E635] shadow-[6px_6px_0px_rgba(163,230,53,0.3)]">
          <h3 className="font-bold text-[#A3E635] flex items-center gap-2 mb-4"><Pencil /> 1. Tên bé</h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input className="flex-1 border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-[#A3E635]" placeholder="Nhập tên bé..." value={studentName} onChange={e => setStudentName(e.target.value)} />
            <button className="bg-[#A3E635] text-white px-4 rounded-xl font-bold">Tìm</button>
          </form>
        </div>

        <div className={`bg-white p-6 rounded-3xl border-2 border-[#FBBF24] shadow-[6px_6px_0px_rgba(251,191,36,0.3)] ${!selectedStudent ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="font-bold text-[#FBBF24] flex items-center gap-2 mb-4"><Calendar /> 2. Chọn lịch</h3>
          <div className="grid grid-cols-2 gap-2">
            {appointments.filter(a => a.lop === selectedStudent?.lop).map((slot: any) => (
              <button 
                key={slot.id}
                disabled={slot.trang_thai === 'đã đặt'}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 rounded-xl text-sm font-bold border-2 ${selectedSlot?.id === slot.id ? 'bg-[#EF4444] text-white border-[#EF4444]' : slot.trang_thai === 'đã đặt' ? 'bg-gray-100 text-gray-400 line-through' : 'border-[#FBBF24] text-[#FBBF24]'}`}
              >
                {slot.gio_hop} ({slot.ngay_hop})
              </button>
            ))}
          </div>
        </div>

        <div className={`col-span-1 md:col-span-2 bg-white p-6 rounded-3xl border-2 border-[#EF4444] shadow-[6px_6px_0px_rgba(239,68,68,0.3)] ${!selectedSlot ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="font-bold text-[#EF4444] flex items-center gap-2 mb-4"><Book /> 3. Thông tin xác nhận</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border-2 border-gray-200 rounded-xl p-3" placeholder="Tên Ba/Mẹ..." value={parentName} onChange={e => setParentName(e.target.value)} />
            <input className="border-2 border-gray-200 rounded-xl p-3" placeholder="Ghi chú cho cô (nếu có)..." value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <button onClick={handleBook} className="w-full mt-6 bg-[#EF4444] text-white py-4 rounded-xl font-black text-lg hover:bg-red-600 flex justify-center items-center gap-2">
            <Send size={20} /> Xác nhận đặt lịch
          </button>
        </div>
      </main>
    </div>
  );
}
