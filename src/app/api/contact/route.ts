import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('messages')
      .insert([{ name, email, message }]);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Pesan berhasil dikirim!' });
  } catch (err) {
    return NextResponse.json({ error: 'Server Internal Error' }, { status: 500 });
  }
}
