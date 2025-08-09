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
}

export default function DigitalProject() {
  const { state } = useLocation();
  const project = state as { id: number; project: string; logo?: string } | undefined;
  const token = localStorage.getItem('token');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filterDate, setFilterDate] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linksModal, setLinksModal] = useState<LinkItem[] | null>(null);
  const [deadline, setDeadline] = useState('');

  const load = async () => {
    if (!project) return;
    const res = await fetch(`${API_URL}/digital/projects/${project.id}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data: TaskItem[] = await res.json();
      setTasks(data.map(t => ({ ...t, links: t.links.map((l, i) => ({ ...l, id: i })) })));
    }
  };

  useEffect(() => { load(); }, []);

  const addTask = async () => {
    if (!project || !title) return;
    const payload = {
      title,
      description: desc,
      deadline: deadline || null,
      links: links.map(({ name, url }) => ({ name, url }))
    };
    const res = await fetch(`${API_URL}/digital/projects/${project.id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const item: TaskItem = await res.json();
      item.links = item.links.map((l, i) => ({ ...l, id: i }));
      setTasks([...tasks, item]);
      setShow(false);
      setTitle('');
      setDesc('');
      setLinks([]);
      setDeadline('');
    }
  };

  const addLink = () => setLinks([...links, { id: Date.now(), name: '', url: '' }]);

  const updateLink = (id: number, field: 'name' | 'url', value: string) => {
    setLinks(links.map(l => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const filtered = tasks.filter(t => {
    if (filterDate === 'today') {
      const d = new Date(t.created_at);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }
    if (filterDate === 'week') {
      const d = new Date(t.created_at).getTime();
      return Date.now() - d <= 7 * 86400000;
    }
    if (filterDate === 'month') {
      const d = new Date(t.created_at).getTime();
      return Date.now() - d <= 30 * 86400000;
    }
    if (filterDate === 'custom' && customDate) {
      const d = new Date(t.created_at);
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
        <button className="px-2 py-1 border rounded" onClick={() => setShow(true)}>Добавить задачу</button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">Название задачи</th>
            <th className="px-2 py-1 border">Описание</th>
            <th className="px-2 py-1 border">Полезные ссылки</th>
            <th className="px-2 py-1 border">Когда поставлена</th>
            <th className="px-2 py-1 border">Дедлайн</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(t => (
            <tr key={t.id} className="text-center">
              <td className="border px-2 py-1">{t.title}</td>
              <td className="border px-2 py-1">{t.description}</td>
              <td className="border px-2 py-1">
                {t.links.length > 0 && (
                  <button className="text-blue-500 underline" onClick={() => setLinksModal(t.links)}>Полезные ссылки</button>
                )}
              </td>
              <td className="border px-2 py-1">{new Date(t.created_at).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}</td>
              <td className="border px-2 py-1">{t.deadline ? new Date(t.deadline).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' }) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[40rem] space-y-2">
            <h3 className="text-lg mb-2">Новая задача</h3>
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
            <input type="datetime-local" className="border p-2 w-full" value={deadline} onChange={e => setDeadline(e.target.value)} />
            <div className="text-right space-x-2">
              <button className="px-3 py-1 border rounded" onClick={() => setShow(false)}>Отмена</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={addTask}>Сохранить</button>
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

