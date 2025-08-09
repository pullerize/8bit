import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../api';

interface LinkItem { id: number; name: string; url: string }
interface TaskItem {
  id: number;
  title: string;
  description: string;
  links: LinkItem[];
  created_at: string;
  deadline?: string;
  high_priority?: boolean;
}

interface ProjectInfo {
  id: number;
  project_id: number;
  project: string;
  service_id: number;
  executor_id: number;
  deadline?: string;
  monthly: boolean;
  logo?: string | null;
}

function timeLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Просрочено';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) {
    return `${days}д ${hours}ч ${minutes}м`;
  }
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${hours}ч ${minutes}м ${seconds}с`;
}

export default function DigitalProject() {
  const { state } = useLocation();
  const [project, setProject] = useState<ProjectInfo | undefined>(state as ProjectInfo | undefined);
  const token = localStorage.getItem('token');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filterDate, setFilterDate] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linksModal, setLinksModal] = useState<LinkItem[] | null>(null);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [timezone, setTimezone] = useState('Asia/Tashkent');
  const [confirm, setConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);
  const [pendingDeadline, setPendingDeadline] = useState<string | null>(null);

  const load = async () => {
    if (!project) return;
    const [res, tz] = await Promise.all([
      fetch(`${API_URL}/digital/projects/${project.id}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_URL}/settings/timezone`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    if (res.ok) {
      const data: TaskItem[] = await res.json();
      data.sort((a,b)=> (b.high_priority?1:0)-(a.high_priority?1:0) || ((a.deadline?new Date(a.deadline).getTime():Infinity)-(b.deadline?new Date(b.deadline).getTime():Infinity)));
      setTasks(data.map(t => ({ ...t, links: t.links.map((l, i) => ({ ...l, id: i })) })));
    }
    if (tz.ok) { const d = await tz.json(); setTimezone(d.timezone); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const id = setInterval(() => setTasks(ts => [...ts]), 1000);
    return () => clearInterval(id);
  }, []);

  const submitTask = async (payload: any) => {
    if (!project) return;
    const url = editId ? `${API_URL}/digital/projects/${project.id}/tasks/${editId}` : `${API_URL}/digital/projects/${project.id}/tasks`;
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const item: TaskItem = await res.json();
      item.links = item.links.map((l, i) => ({ ...l, id: i }));
      if (editId) {
        setTasks(tasks.map(t => (t.id === editId ? item : t)).sort((a,b)=> (b.high_priority?1:0)-(a.high_priority?1:0) || ((a.deadline?new Date(a.deadline).getTime():Infinity)-(b.deadline?new Date(b.deadline).getTime():Infinity))));
      } else {
        setTasks([...tasks, item].sort((a,b)=> (b.high_priority?1:0)-(a.high_priority?1:0) || ((a.deadline?new Date(a.deadline).getTime():Infinity)-(b.deadline?new Date(b.deadline).getTime():Infinity))));
      }
      setShow(false);
      setTitle('');
      setDesc('');
      setLinks([]);
      setDeadlineDate('');
      setDeadlineTime('');
      setEditId(null);
    }
  };

  const saveTask = async () => {
    if (!project || !title) return;
    const deadline = !deadlineDate || !deadlineTime ? null : `${deadlineDate}T${deadlineTime}`;
    const payload = {
      title,
      description: desc,
      deadline,
      links: links.map(({ name, url }) => ({ name, url })),
      high_priority: editId ? tasks.find(t => t.id === editId)?.high_priority ?? false : false
    };
    if (deadline && project.deadline && new Date(deadline) > new Date(project.deadline)) {
      setPendingPayload(payload);
      setPendingDeadline(deadline);
      setConfirm(true);
      return;
    }
    await submitTask(payload);
  };

  const continueWithDeadline = async () => {
    if (!project || !pendingPayload || !pendingDeadline) return;
    await fetch(`${API_URL}/digital/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        project_id: project.project_id,
        service_id: project.service_id,
        executor_id: project.executor_id,
        deadline: pendingDeadline,
        monthly: project.monthly
      })
    });
    setProject({ ...project, deadline: pendingDeadline });
    await submitTask(pendingPayload);
    setConfirm(false);
    setPendingPayload(null);
    setPendingDeadline(null);
  };

  const addLink = () => setLinks([...links, { id: Date.now(), name: '', url: '' }]);

  const updateLink = (id: number, field: 'name' | 'url', value: string) => {
    setLinks(links.map(l => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleTimeChange = (val: string) => {
    let v = val.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2);
    setDeadlineTime(v);
  };

  const openAdd = () => {
    setEditId(null);
    setTitle('');
    setDesc('');
    setLinks([]);
    setDeadlineDate('');
    setDeadlineTime('');
    setShow(true);
  };

  const openEdit = (t: TaskItem) => {
    setEditId(t.id);
    setTitle(t.title);
    setDesc(t.description);
    setLinks(t.links.map((l, i) => ({ ...l, id: i }))); // ensure ids
    if (t.deadline) {
      const d = new Date(t.deadline);
      setDeadlineDate(d.toISOString().slice(0, 10));
      setDeadlineTime(d.toISOString().slice(11, 16));
    } else {
      setDeadlineDate('');
      setDeadlineTime('');
    }
    setShow(true);
  };

  const toggleTaskPriority = async (t: TaskItem) => {
    if (!project) return;
    await fetch(`${API_URL}/digital/projects/${project.id}/tasks/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: t.title,
        description: t.description,
        deadline: t.deadline,
        links: t.links.map(({name,url})=>({name,url})),
        high_priority: !t.high_priority
      })
    });
    setTasks(tasks.map(it => it.id === t.id ? { ...it, high_priority: !it.high_priority } : it).sort((a,b)=> (b.high_priority?1:0)-(a.high_priority?1:0) || ((a.deadline?new Date(a.deadline).getTime():Infinity)-(b.deadline?new Date(b.deadline).getTime():Infinity))));
  };

  const remove = async (id: number) => {
    await fetch(`${API_URL}/digital/projects/${project?.id}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(tasks.filter(t => t.id !== id));
    if (editId === id) setShow(false);
  };

  const filtered = tasks.filter(t => {
    if (filterDate === 'today') {
      const d = new Date(t.created_at.endsWith('Z') ? t.created_at : t.created_at + 'Z');
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }
    if (filterDate === 'week') {
      const d = new Date(t.created_at.endsWith('Z') ? t.created_at : t.created_at + 'Z').getTime();
      return Date.now() - d <= 7 * 86400000;
    }
    if (filterDate === 'month') {
      const d = new Date(t.created_at.endsWith('Z') ? t.created_at : t.created_at + 'Z').getTime();
      return Date.now() - d <= 30 * 86400000;
    }
    if (filterDate === 'custom' && customDate) {
      const d = new Date(t.created_at.endsWith('Z') ? t.created_at : t.created_at + 'Z');
      const sel = new Date(customDate);
      return d.toDateString() === sel.toDateString();
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {project?.logo ? (
        <img src={`${API_URL}/${project.logo}`} className="h-24 mx-auto" />
      ) : (
        <h2 className="text-center text-xl">{project?.project}</h2>
      )}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select className="border p-1" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option value="all">За все время</option>
            <option value="today">За сегодня</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="custom">Выбрать дату</option>
          </select>
          {filterDate === 'custom' && (
            <input type="date" className="border p-1" value={customDate} onChange={e => setCustomDate(e.target.value)} />
          )}
        </div>
        <button className="px-2 py-1 border rounded" onClick={openAdd}>Добавить задачу</button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border"></th>
            <th className="px-2 py-1 border">Название задачи</th>
            <th className="px-2 py-1 border">Описание</th>
            <th className="px-2 py-1 border">Полезные ссылки</th>
            <th className="px-2 py-1 border">Когда поставлена</th>
            <th className="px-2 py-1 border">Дедлайн</th>
            <th className="px-2 py-1 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(t => (
            <tr key={t.id} className="text-center">
              <td className="border px-2 py-1 cursor-pointer" onClick={() => toggleTaskPriority(t)}>
                {t.high_priority ? '★' : '☆'}
              </td>
              <td className="border px-2 py-1">{t.title}</td>
              <td className="border px-2 py-1">{t.description}</td>
              <td className="border px-2 py-1">
                {t.links.length > 0 && (
                  <button className="text-blue-500 underline" onClick={() => setLinksModal(t.links)}>Полезные ссылки</button>
                )}
              </td>
              <td className="border px-2 py-1">{new Date(t.created_at.endsWith('Z') ? t.created_at : t.created_at + 'Z').toLocaleString('ru-RU', { timeZone: timezone })}</td>
              <td className="border px-2 py-1">{t.deadline ? timeLeft(t.deadline) : ''}</td>
              <td className="border px-2 py-1 space-x-2">
                <button className="text-blue-500" onClick={() => openEdit(t)}>Редактировать</button>
                <button className="text-green-600" onClick={() => remove(t.id)}>Завершено</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[40rem] space-y-2">
            <h3 className="text-lg mb-2">{editId ? 'Редактировать задачу' : 'Новая задача'}</h3>
            <input className="border p-2 w-full" placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="border p-2 w-full" placeholder="Описание" value={desc} onChange={e => setDesc(e.target.value)} />
            <div className="space-y-1">
              {links.map(l => (
                <div key={l.id} className="flex gap-1">
                  <input className="border p-1 flex-1" placeholder="Название" value={l.name} onChange={e => updateLink(l.id, 'name', e.target.value)} />
                  <input className="border p-1 flex-1" placeholder="Ссылка" value={l.url} onChange={e => updateLink(l.id, 'url', e.target.value)} />
                </div>
              ))}
            </div>
            <button className="text-sm text-blue-500" onClick={addLink}>Добавить ссылку</button>
            <div className="flex gap-2">
              <input type="date" className="border p-2 flex-1" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} />
              <input className="border p-2 w-24" placeholder="00:00" value={deadlineTime} onChange={e => handleTimeChange(e.target.value)} />
            </div>
            <div className="text-right space-x-2">
              <button className="px-3 py-1 border rounded" onClick={() => { setShow(false); setEditId(null); }}>Отмена</button>
              {editId && <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => remove(editId)}>Удалить</button>}
              <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={saveTask}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
      {confirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-80 space-y-4">
            <p>Дедлайн задачи позже дедлайна проекта.</p>
            <div className="text-right space-x-2">
              <button className="px-3 py-1 border rounded" onClick={() => setConfirm(false)}>Изменить дедлайн</button>
              <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={continueWithDeadline}>Продолжить</button>
            </div>
          </div>
        </div>
      )}
      {linksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96 space-y-2">
            <h3 className="text-lg mb-2">Полезные ссылки</h3>
            <ul className="list-disc pl-4 space-y-1">
              {linksModal.map(l => (
                <li key={l.id}>
                  <a className="text-blue-500 underline" href={l.url} target="_blank" rel="noreferrer">{l.name || l.url}</a>
                </li>
              ))}
            </ul>
            <div className="text-right">
              <button className="px-3 py-1 border rounded" onClick={() => setLinksModal(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

