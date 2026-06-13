'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: any, formData: FormData) {
  const adminId = formData.get('adminId');
  const password = formData.get('password');

  // Hardcode theo yêu cầu, sẽ đổi sau
  if (adminId === 'admin' && password === 'admin123') {
    cookies().set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 tuần
      path: '/',
    });
    
    redirect('/admin');
  } else {
    return { error: 'Sai ID hoặc Mật khẩu. Vui lòng thử lại.' };
  }
}

export async function logoutAdmin() {
  cookies().delete('admin_session');
  redirect('/admin/login');
}
