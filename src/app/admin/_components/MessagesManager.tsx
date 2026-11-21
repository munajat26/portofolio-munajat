'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { MessageRow } from '@/types';
import { Empty, NoticeBar, PageTitle, fmtDate, useNotice } from './ui';

export default function MessagesManager() {
  const [items, setItems] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [notice, setNotice] = useNotice();

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (error) setNotice({ type: 'error', text: error.message });
    else setItems((data ?? []) as MessageRow[]);
    setLoading(false);
  }, [setNotice]);

  useEffect(() => { load(); }, [load]);

  const setRead = async (m: MessageRow, read: boolean) => {
    const { error } = await supabase.from('messages').update({ is_read: read }).eq('id', m.id);
    if (error) setNotice({ type: 'error', text: error.message });
    else setItems((list) => list.map((x) => (x.id === m.id ? { ...x, is_read: read } : x)));
  };

  const toggle = (m: MessageRow) => {
    const next = open === m.id ? null : m.id;
    setOpen(next);
    if (next && !m.is_read) setRead(m, true);
  };

  const remove = async (m: MessageRow) => {
    if (!window.confirm(`Hapus pesan dari ${m.name}?`)) return;
    const { error } = await supabase.from('messages').delete().eq('id', m.id);
    if (error) setNotice({ type: 'error', text: error.message });
    else setItems((list) => list.filter((x) => x.id !== m.id));
  };

  const unread = items.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <PageTitle title="Pesan masuk" desc={`Pesan dari formulir kontak. ${unread > 0 ? `${unread} belum dibaca.` : 'Semua sudah dibaca.'}`} />
      <NoticeBar notice={notice} />
      {loading ? <Empty text="Memuat..." /> : items.length === 0 ? <Empty text="Belum ada pesan masuk." /> : (
        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m.id} className="card overflow-hidden">
              <button type="button" onClick={() => toggle(m)} className="flex w-full items-center gap-3 p-4 text-left">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${m.is_read ? 'bg-fg/10 text-muted' : 'bg-crimson/15 text-crimson'}`}>{m.is_read ? <MailOpen size={18} /> : <Mail size={18} />}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${m.is_read ? 'font-medium text-fg' : 'font-bold text-fg'}`}>{m.name} <span className="font-normal text-muted">· {m.email}</span></span>
                  <span className="block truncate text-xs text-muted">{m.message}</span>
                </span>
                <span className="hidden shrink-0 text-xs text-muted sm:block">{fmtDate(m.created_at)}</span>
              </button>
              {open === m.id && (
                <div className="space-y-3 border-t border-fg/10 p-4">
                  <p className="whitespace-pre-wrap break-words text-sm text-fg">{m.message}</p>
                  <p className="text-xs text-muted sm:hidden">{fmtDate(m.created_at)}</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent("Balasan dari Mun's Project")}`} className="btn-primary gap-2 px-4 py-2 text-xs"><Mail size={14} /> Balas via email</a>
                    <button type="button" onClick={() => setRead(m, false)} className="btn-ghost px-4 py-2 text-xs">Tandai belum dibaca</button>
                    <button type="button" onClick={() => remove(m)} className="btn-ghost gap-1.5 px-4 py-2 text-xs hover:!border-red-500 hover:!text-red-500"><Trash2 size={14} /> Hapus</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
