import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import DigitalProject from './DigitalProject';

interface ProjectOption { id: number; name: string }
interface Service { id: number; name: string }
interface User { id: number; name: string; role: string }

interface DigitalItem {
  id: number;
  project: string;
  service: string;
  executor: string;
  created_at: string;
  deadline?: string;
  monthly: boolean;
  logo?: string;
}

function timeLeft(dateStr: string) {
  const target = new Date(dateStr).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return 'Просрочено';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}ч ${m}м`;
}

function DigitalList() {
  const token = localStorage.getItem('token');
  const [items, setItems] = useState<DigitalItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [show, setShow] = useState(false);
  const [proj, setProj] = useState('');
  const [service, setService] = useState('');
  const [executor, setExecutor] = useState('');
  const [deadline, setDeadline] = useState('');
  const [monthly, setMonthly] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    const [resP, resS, resU, resD] = await Promise.all([
      fetch(`${API_URL}/projects/`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/digital/services`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/users/`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/digital/projects`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    if (resP.ok) setProjects(await resP.json());
    if (resS.ok) setServices(await resS.json());
    if (resU.ok) setUsers(await resU.json());
    if (resD.ok) setItems(await resD.json());
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!proj || !service || !executor) return;
    const payload = {
      project_id: Number(proj),
      service_id: Number(service),
      executor_id: Number(executor),
      deadline: monthly || !deadline ? null : deadline,
      monthly
    };
    const res = await fetch(`${API_URL}/digital/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      let item = await res.json();
      if (logo) {
        const form = new FormData();
        form.append('file', logo);
        const lr = await fetch(`${API_URL}/digital/projects/${item.id}/logo`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form
        });
        if (lr.ok) {
          const data = await lr.json();
          item.logo = data.logo;
        }
      }
      setItems([...items, item]);
      setShow(false);
      setProj('');
      setService('');
      setExecutor('');
      setDeadline('');
      setMonthly(false);
      setLogo(null);
    }
  };

  const changeLogo = async (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/digital/projects/${id}/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    if (res.ok) {
      const data = await res.json();
      setItems(items.map(it => it.id === id ? { ...it, logo: data.logo } : it));
    }
  };

  const removeLogo = async (id: number) => {
    const res = await fetch(`${API_URL}/digital/projects/${id}/logo`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setItems(items.map(it => it.id === id ? { ...it, logo: undefined } : it));
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-right">
        <button className="px-2 py-1 border rounded" onClick={() => setShow(true)}>Добавить проект</button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">Логотип</th>
            <th className="px-2 py-1 border">Вид услуги</th>
            <th className="px-2 py-1 border">Исполнитель</th>
            <th className="px-2 py-1 border">Время создания</th>
            <th className="px-2 py-1 border">Дедлайн</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id} className="text-center hover:bg-gray-50" onClick={() => navigate(String(it.id), { state: it })}>
              <td className="border px-2 py-1" onClick={e => e.stopPropagation()}>
                {it.logo ? (
                  <img src={`${API_URL}/${it.logo}`} className="w-12 h-12 object-cover mx-auto" />
                ) : (
                  <span className="text-sm text-gray-500">Нет</span>
                )}
                <div className="space-x-1 mt-1">
                  <label className="text-blue-500 underline cursor-pointer">
                    Изменить
                    <input type="file" className="hidden" onChange={e => e.target.files && changeLogo(it.id, e.target.files[0])} />
                  </label>
                  {it.logo && (
                    <button className="text-red-500" onClick={() => removeLogo(it.id)}>Удалить</button>
                  )}
                </div>
              </td>
              <td className="border px-2 py-1">{it.service}</td>
              <td className="border px-2 py-1">{it.executor}</td>
              <td className="border px-2 py-1">{new Date(it.created_at).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}</td>
              <td className="border px-2 py-1">{it.monthly ? 'Ежемесячно' : it.deadline ? timeLeft(it.deadline) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[32rem] space-y-2">
            <h3 className="text-lg mb-2">Новый проект</h3>
            <select className="border p-2 w-full" value={proj} onChange={e => setProj(e.target.value)}>
              <option value="">Выберите проект</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="border p-2 w-full" value={service} onChange={e => setService(e.target.value)}>
              <option value="">Выберите услугу</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="border p-2 w-full" value={executor} onChange={e => setExecutor(e.target.value)}>
              <option value="">Выберите исполнителя</option>
              {users.filter(u => u.role === 'digital').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {!monthly && (
              <input type="datetime-local" className="border p-2 w-full" value={deadline} onChange={e => setDeadline(e.target.value)} />
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={monthly} onChange={e => setMonthly(e.target.checked)} />
              Ежемесячно
            </label>
            <input type="file" className="border p-2 w-full" onChange={e => setLogo(e.target.files ? e.target.files[0] : null)} />
            <div className="text-right space-x-2">
              <button className="px-3 py-1 border rounded" onClick={() => setShow(false)}>Отмена</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={add}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DigitalTasks() {
  return (
    <Routes>
      <Route index element={<DigitalList />} />
      <Route path=":id" element={<DigitalProject />} />
    </Routes>
  );
}
