import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import DigitalProject from './DigitalProject';

interface ProjectOption { id: number; name: string }
interface User { id: number; name: string; role: string }

interface DigitalItem {
  id: number;
  project: string;
  service: string;
  executor: string;
  createdAt: string;
  deadline?: string;
  monthly: boolean;
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
  const [users, setUsers] = useState<User[]>([]);
  const [show, setShow] = useState(false);
  const [proj, setProj] = useState('');
  const [service, setService] = useState('');
  const [executor, setExecutor] = useState('');
  const [deadline, setDeadline] = useState('');
  const [monthly, setMonthly] = useState(false);
  const navigate = useNavigate();

  const serviceOptions = ['Дизайн', 'SMM'];

  useEffect(() => {
    const load = async () => {
      const resP = await fetch(`${API_URL}/projects/`, { headers: { Authorization: `Bearer ${token}` } });
      if (resP.ok) setProjects(await resP.json());
      const resU = await fetch(`${API_URL}/users/`, { headers: { Authorization: `Bearer ${token}` } });
      if (resU.ok) setUsers(await resU.json());
    };
    load();
  }, []);

  const add = () => {
    if (!proj || !service || !executor) return;
    const item: DigitalItem = {
      id: Date.now(),
      project: proj,
      service,
      executor,
      createdAt: new Date().toISOString(),
      deadline: monthly || !deadline ? undefined : deadline,
      monthly,
    };
    setItems([...items, item]);
    setShow(false);
    setProj('');
    setService('');
    setExecutor('');
    setDeadline('');
    setMonthly(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-right">
        <button className="px-2 py-1 border rounded" onClick={() => setShow(true)}>Добавить проект</button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">Название проекта</th>
            <th className="px-2 py-1 border">Вид услуги</th>
            <th className="px-2 py-1 border">Исполнитель</th>
            <th className="px-2 py-1 border">Время создания</th>
            <th className="px-2 py-1 border">Дедлайн</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id} className="text-center cursor-pointer hover:bg-gray-50" onClick={() => navigate(String(it.id), { state: it })}>
              <td className="border px-2 py-1">{it.project}</td>
              <td className="border px-2 py-1">{it.service}</td>
              <td className="border px-2 py-1">{it.executor}</td>
              <td className="border px-2 py-1">{new Date(it.createdAt).toLocaleString('ru-RU')}</td>
              <td className="border px-2 py-1">{it.monthly ? 'Ежемесячно' : it.deadline ? timeLeft(it.deadline) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96 space-y-2">
            <h3 className="text-lg mb-2">Новый проект</h3>
            <select className="border p-2 w-full" value={proj} onChange={e => setProj(e.target.value)}>
              <option value="">Выберите проект</option>
              {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <select className="border p-2 w-full" value={service} onChange={e => setService(e.target.value)}>
              <option value="">Выберите услугу</option>
              {serviceOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="border p-2 w-full" value={executor} onChange={e => setExecutor(e.target.value)}>
              <option value="">Выберите исполнителя</option>
              {users.filter(u => u.role === 'digital').map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
            {!monthly && (
              <input type="datetime-local" className="border p-2 w-full" value={deadline} onChange={e => setDeadline(e.target.value)} />
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={monthly} onChange={e => setMonthly(e.target.checked)} />
              Ежемесячно
            </label>
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

