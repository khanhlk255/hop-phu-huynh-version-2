'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAdmin } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
        pending ? 'bg-slate-500 cursor-not-allowed' : 'bg-[#1E3A8A] hover:bg-[#152e73] shadow-md hover:shadow-lg'
      }`}
    >
      {pending ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
    </button>
  );
}

export default function AdminLogin() {
  const [state, formAction] = useFormState(loginAdmin, null);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-[#1E3A8A] p-6 text-center">
          <h1 className="text-2xl font-black text-white tracking-wide">QUẢN TRỊ HỆ THỐNG</h1>
          <p className="text-indigo-200 mt-2 text-sm">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <div className="p-8">
          <form action={formAction} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ID Đăng Nhập
              </label>
              <input
                type="text"
                name="adminId"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-[#1E3A8A] focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-slate-50 focus:bg-white"
                placeholder="Nhập admin ID..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mật Khẩu
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-[#1E3A8A] focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-slate-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200 text-center font-medium">
                {state.error}
              </div>
            )}

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
