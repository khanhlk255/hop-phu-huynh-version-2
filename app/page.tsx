"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Star, Sun, Heart, Send, Pencil, Book, Trophy, CheckCircle2, Clock, CalendarDays, Search, Smile, UserRound, StickyNote, RefreshCw, Sparkles, Quote } from "lucide-react";

export default function Home() {
  const [students, setStudents] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedApt, setSelectedApt] = useState<any | null>(null);
  const [attendee, setAttendee] = useState("Ba & Mẹ");
  const [note, setNote] = useState("");
  
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<any | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApptsLoaded, setIsApptsLoaded] = useState(false);

  // Fetch Students once
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(data);
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };
    fetchStudents();
  }, []);

  // Listen to Appointments REAL-TIME
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "appointments"), (snapshot) => {
      const appts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllAppointments(appts);
      setIsApptsLoaded(true);
    }, (error) => {
      console.error("Failed to listen to appointments", error);
      setIsApptsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // Extract booked student combinations
  const bookedStudentKeys = allAppointments
    .filter(a => a.trang_thai === "đã đặt" && a.ten_hoc_sinh)
    .map(a => `${a.ten_hoc_sinh}-${a.lop}`);

  // Only show students who haven't booked
  const availableStudents = students.filter(s => !bookedStudentKeys.includes(`${s.ten_hoc_sinh}-${s.lop}`));

  // Filter for search
  const searchResults = searchTerm
    ? availableStudents.filter(s => 
        s.ten_hoc_sinh.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const classAppointments = selectedStudent 
    ? allAppointments.filter(a => a.lop === selectedStudent.lop)
    : [];

  // Group by date
  const groupedAppts = classAppointments.reduce((acc, curr) => {
    if (!acc[curr.ngay_hop]) acc[curr.ngay_hop] = [];
    acc[curr.ngay_hop].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(groupedAppts).sort();

  const handleBook = async () => {
    if (!selectedStudent || !selectedApt) {
      alert("Vui lòng chọn học sinh và khung giờ.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Double check directly with server to prevent race conditions
      const aptRef = doc(db, "appointments", selectedApt.id);
      const aptSnap = await getDoc(aptRef);
      if (aptSnap.exists() && aptSnap.data().trang_thai === "đã đặt") {
         alert("Khung giờ bạn chọn vừa có phụ huynh khác đăng ký. Vui lòng chọn giờ khác.");
         setIsSubmitting(false);
         setSelectedApt(null);
         return;
      }

      await updateDoc(aptRef, {
        trang_thai: "đã đặt",
        ten_hoc_sinh: selectedStudent.ten_hoc_sinh,
        nguoi_tham_du: attendee,
        ghi_chu: note
      });

      setBookedDetails({
        studentName: selectedStudent.ten_hoc_sinh,
        lop: selectedStudent.lop,
        date: selectedApt.ngay_hop,
        time: selectedApt.gio_hop,
        attendee: attendee
      });
      setBookingSuccess(true);
      
    } catch (err) {
      console.error("Failed to book appointment", err);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBookingSuccess(false);
    setBookedDetails(null);
    setSelectedStudent(null);
    setSearchTerm("");
    setSelectedApt(null);
    setAttendee("Ba & Mẹ");
    setNote("");
  };

  const isFormComplete = selectedStudent && selectedApt;

  // Real-time double check for currently selected apt
  const isSelectedAptBooked = selectedApt 
    ? allAppointments.find(a => a.id === selectedApt.id)?.trang_thai === "đã đặt"
    : false;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* CÁC ICON TRANG TRÍ DỄ THƯƠNG (DOODLE) */}
      <Sun className="absolute top-0 right-10 text-yellow-400 w-32 h-32 opacity-20 -z-10 animate-[spin_60s_linear_infinite] hidden lg:block" />
      <Star className="absolute top-40 left-10 text-pink-300 w-16 h-16 opacity-30 -z-10 hidden lg:block animate-pulse" />
      <Star className="absolute bottom-40 right-20 text-blue-300 w-10 h-10 opacity-30 -z-10 hidden lg:block animate-pulse" style={{ animationDelay: '1s' }} />
      <Pencil className="absolute bottom-20 left-20 text-emerald-300 w-24 h-24 opacity-20 -z-10 -rotate-45 hidden lg:block" />

      {bookingSuccess && bookedDetails ? (
        <div className="max-w-3xl mx-auto mt-10">
          <div className="bg-amber-50/50 p-8 rounded-[3rem] border-4 border-dashed border-yellow-300 shadow-[8px_8px_0px_rgba(253,224,71,0.5)] text-center relative overflow-hidden">
            {/* Confetti decoration */}
            <Sparkles className="absolute top-10 left-10 text-pink-400 w-10 h-10 animate-bounce" />
            <Sparkles className="absolute top-20 right-16 text-blue-400 w-8 h-8 animate-bounce" style={{ animationDelay: '0.5s' }} />
            
            <div className="w-28 h-28 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-yellow-200">
              <Trophy className="w-14 h-14 text-white" />
            </div>
            
            <h2 className="text-4xl font-black text-rose-500 mb-2">PHIẾU BÉ NGOAN</h2>
            <p className="text-xl text-slate-700 font-bold mb-8">Ba Mẹ đã đặt lịch họp thành công! 🎉</p>
            
            <div className="bg-white rounded-3xl p-8 text-left space-y-4 max-w-lg mx-auto border-2 border-dashed border-emerald-200 shadow-sm relative">
              <div className="absolute -top-4 -right-4 bg-emerald-400 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-md rotate-12">
                #1
              </div>

              <div className="flex items-center gap-4 border-b-2 border-dashed border-gray-100 pb-4">
                <Smile className="w-8 h-8 text-pink-400" />
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase">Học sinh</p>
                  <p className="text-xl font-black text-slate-800">{bookedDetails.studentName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 border-b-2 border-dashed border-gray-100 pb-4">
                <Book className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase">Lớp học</p>
                  <p className="text-xl font-black text-slate-800">{bookedDetails.lop}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-b-2 border-dashed border-gray-100 pb-4">
                <CalendarDays className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase">Thời gian họp</p>
                  <p className="text-xl font-black text-emerald-600">{bookedDetails.time} <span className="text-slate-500 text-base">| Ngày {bookedDetails.date}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <UserRound className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase">Người tham dự</p>
                  <p className="text-lg font-bold text-slate-700">{bookedDetails.attendee}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={resetForm}
              className="mt-10 inline-flex items-center justify-center gap-2 bg-white text-emerald-600 border-2 border-emerald-400 font-black py-4 px-8 rounded-2xl transition-all shadow-[4px_4px_0px_rgba(52,211,153,1)] hover:shadow-[2px_2px_0px_rgba(52,211,153,1)] hover:translate-y-[2px] hover:translate-x-[2px]"
            >
              <RefreshCw className="w-5 h-5" />
              Đăng ký bé tiếp theo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
          
          {/* CỘT TRÁI: STORYTELLING */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-10 pt-6">
            <div className="inline-block bg-yellow-100 px-5 py-2.5 rounded-2xl border-2 border-dashed border-yellow-400 text-yellow-700 font-black mb-2 shadow-[2px_2px_0px_rgba(250,204,21,1)] rotate-[-2deg]">
              Cuộc họp phụ huynh cuối năm 🎨
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-800 leading-[1.1]">
              Hành Trình Khôn Lớn Của Con
            </h2>
            
            <div className="relative mt-8">
              <div className="absolute -left-4 -top-4 w-12 h-12 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              
              <p className="text-lg text-slate-700 leading-relaxed font-semibold bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] border-2 border-dashed border-blue-200 shadow-[4px_4px_0px_rgba(191,219,254,1)] relative z-10">
                <span className="text-4xl text-blue-300 absolute -top-4 -left-2 rotate-12">"</span>
                Một năm học nữa lại trôi qua với biết bao tiếng cười, những nét chữ rèn vội và cả những bài học mới. Đây là khoảnh khắc tuyệt vời để Ba Mẹ và Nhà trường cùng ngồi lại, nhìn lại chặng đường con đã đi qua, và vẽ tiếp những ước mơ rực rỡ cho năm học tới.
                <br/><br/>
                Ba Mẹ hãy chọn một khung giờ phù hợp để trò chuyện cùng Cô giáo chủ nhiệm nhé! ❤️
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: FORM ĐẶT LỊCH (Giữ nguyên logic) */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 md:p-10 rounded-[3rem] border-4 border-slate-100 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
              
              {/* Trang trí góc giấy */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-100 to-transparent rounded-bl-3xl"></div>

              <div className="space-y-12 relative z-10">
                {/* BƯỚC 1: TÊN HỌC SINH */}
                <div>
                  <label className="flex items-center gap-2 text-lg font-black text-slate-700 mb-4">
                    <span className="bg-rose-200 text-rose-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Họ và tên đầy đủ của bé <span className="text-rose-500">*</span>
                  </label>
                  
                  {selectedStudent ? (
                    <div className="flex items-center justify-between bg-emerald-50 border-2 border-dashed border-emerald-300 p-4 rounded-2xl shadow-[2px_2px_0px_rgba(110,231,183,1)]">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <div>
                          <p className="text-emerald-800 font-bold">{selectedStudent.ten_hoc_sinh}</p>
                          <p className="text-emerald-600 text-xs font-semibold">{selectedStudent.lop}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedStudent(null)}
                        className="text-xs font-bold text-rose-500 bg-white border border-rose-200 px-3 py-1.5 rounded-xl hover:bg-rose-50"
                      >
                        Chọn lại
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-blue-300" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-dashed border-blue-200 rounded-2xl focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-semibold text-slate-700 placeholder-slate-400"
                        placeholder="Ba mẹ gõ tên con vào đây nhé..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      
                      {searchTerm && (
                        <div className="absolute mt-2 w-full bg-white border-2 border-dashed border-blue-200 rounded-2xl shadow-lg max-h-60 overflow-auto z-20 p-2">
                          {searchResults.length > 0 ? (
                            searchResults.map((student) => (
                              <div
                                key={student.id}
                                className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center rounded-xl transition-colors mb-1"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setSearchTerm("");
                                }}
                              >
                                <span className="font-bold text-slate-700">{student.ten_hoc_sinh}</span>
                                <span className="text-xs font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{student.lop}</span>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-slate-400 font-medium">
                              Không tìm thấy học sinh nào hoặc bé đã được đặt lịch.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Các bước dưới bị làm mờ nếu chưa chọn học sinh */}
                <div className={`transition-all duration-500 space-y-12 ${!selectedStudent ? 'opacity-30 pointer-events-none grayscale-[50%]' : 'opacity-100'}`}>
                  
                  {/* BƯỚC 2: ĐẠI DIỆN */}
                  <div>
                    <label className="flex items-center gap-2 text-lg font-black text-slate-700 mb-4">
                      <span className="bg-orange-200 text-orange-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                      Ai sẽ tham gia họp cùng Cô? <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["Ba", "Mẹ", "Ba & Mẹ", "Người giám hộ khác"].map((role) => (
                        <label 
                          key={role} 
                          className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 cursor-pointer font-bold transition-all
                            ${attendee === role 
                              ? 'bg-orange-100 border-orange-400 text-orange-800 shadow-[2px_2px_0px_rgba(251,146,60,1)]' 
                              : 'bg-white border-dashed border-gray-300 text-gray-500 hover:border-orange-300 hover:bg-orange-50'}`}
                        >
                          <input
                            type="radio"
                            name="attendee"
                            value={role}
                            checked={attendee === role}
                            onChange={(e) => setAttendee(e.target.value)}
                            className="hidden"
                          />
                          {role}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* BƯỚC 3: LỊCH HỌP */}
                  <div>
                    <label className="flex items-center gap-2 text-lg font-black text-slate-700 mb-4">
                      <span className="bg-emerald-200 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                      Ba Mẹ chọn khung giờ nào? <span className="text-rose-500">*</span>
                    </label>
                    
                    {(!selectedStudent) ? (
                       <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold">
                         Vui lòng chọn học sinh ở Bước 1
                       </div>
                    ) : (!isApptsLoaded) ? (
                       <div className="text-center py-10 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl text-blue-500 font-black animate-pulse flex flex-col items-center justify-center gap-2">
                         <RefreshCw className="w-6 h-6 animate-spin" />
                         Đang tải dữ liệu...
                       </div>
                    ) : (
                      <div className="space-y-8">
                        {sortedDates.map(date => {
                          const apptsInDate = [...groupedAppts[date]].sort((a, b) => {
                            const timeA = parseInt(a.gio_hop.split('h')[0]);
                            const timeB = parseInt(b.gio_hop.split('h')[0]);
                            return timeA - timeB;
                          });

                          return (
                            <div key={date}>
                              <h4 className="font-black text-slate-700 mb-4 flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-emerald-500" />
                                Ngày {date}
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {apptsInDate.map(apt => {
                                  // Kiểm tra trạng thái đã đặt
                                  const isBooked = apt.trang_thai === 'đã đặt';
                                  const isSelected = selectedApt?.id === apt.id;
                                  
                                  return (
                                    <button
                                      key={apt.id}
                                      disabled={isBooked}
                                      onClick={() => setSelectedApt(apt)}
                                      className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[90px] overflow-hidden group
                                        ${isBooked 
                                          ? 'bg-rose-50 border-dashed border-rose-200 text-rose-300 cursor-not-allowed opacity-80' 
                                          : isSelected
                                            ? 'bg-emerald-400 border-emerald-500 text-white shadow-[4px_4px_0px_rgba(16,185,129,1)] scale-[1.02]'
                                            : 'bg-white border-dashed border-gray-300 text-slate-600 hover:border-emerald-400 hover:text-emerald-600 cursor-pointer hover:bg-emerald-50 hover:shadow-[2px_2px_0px_rgba(52,211,153,0.5)] hover:-translate-y-1'
                                        }`}
                                    >
                                      <span className={`font-black text-xl z-10 ${isBooked ? 'line-through' : ''}`}>{apt.gio_hop}</span>
                                      
                                      {!isBooked && (
                                        <span className={`text-[10px] font-black mt-1 uppercase tracking-widest z-10 ${isSelected ? 'text-emerald-100' : 'text-slate-400 group-hover:text-emerald-500'}`}>
                                          {isSelected ? "Đang chọn" : "Trống"}
                                        </span>
                                      )}

                                      {isBooked && (
                                        <div className="absolute inset-0 bg-rose-100/50 flex flex-col items-center justify-center z-20 backdrop-blur-[1px]">
                                          <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-rose-300 shadow-sm -rotate-6">ĐÃ ĐẶT</span>
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* BƯỚC 4: GHI CHÚ */}
                  <div>
                    <label className="flex items-center gap-2 text-lg font-black text-slate-700 mb-4">
                      <span className="bg-blue-200 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                      Ghi chú thêm cho Cô (Nếu có)
                    </label>
                    <div className="relative">
                      <StickyNote className="absolute top-4 left-4 text-blue-300 w-5 h-5" />
                      <textarea
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-dashed border-blue-200 rounded-2xl focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700 placeholder-slate-400 min-h-[120px] resize-none"
                        placeholder="Những điều Ba Mẹ muốn trao đổi thêm..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  {/* NÚT XÁC NHẬN */}
                  <div className="pt-6 border-t-2 border-dashed border-gray-200">
                    <button
                      onClick={handleBook}
                      disabled={!isFormComplete || isSubmitting || isSelectedAptBooked}
                      className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3
                        ${(!isFormComplete || isSelectedAptBooked)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-dashed border-gray-300' 
                          : isSubmitting
                            ? 'bg-yellow-200 text-yellow-700 cursor-wait border-2 border-yellow-400'
                            : 'bg-yellow-400 text-slate-900 border-2 border-slate-900 hover:bg-yellow-300 shadow-[6px_6px_0px_rgba(15,23,42,1)] hover:shadow-[3px_3px_0px_rgba(15,23,42,1)] hover:translate-y-[3px] hover:translate-x-[3px] active:shadow-none active:translate-y-[6px] active:translate-x-[6px]'
                        }`}
                    >
                      {isSubmitting ? (
                         <>
                           <RefreshCw className="w-6 h-6 animate-spin" />
                           Đang nộp phiếu...
                         </>
                      ) : (
                         <>
                           <Send className="w-6 h-6" />
                           Gửi Phiếu Đăng Ký
                         </>
                      )}
                    </button>
                    {!isFormComplete && (
                      <p className="text-center text-sm text-rose-400 font-bold mt-4">
                        * Ba Mẹ nhớ điền tên bé và chọn giờ trước khi nộp phiếu nhé!
                      </p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
