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
  const [filterProj, setFilterProj] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterExec, setFilterExec] = useState('');
  const [timezone, setTimezone] = useState('Asia/Tashkent');
  const navigate = useNavigate();

  const load = async () => {
    const [resP, resS, resU, resD, resT] = await Promise.all([
      fetch(`${API_URL}/projects/`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/digital/services`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/users/`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/digital/projects`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/settings/timezone`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    if (resP.ok) setProjects(await resP.json());
    if (resS.ok) setServices(await resS.json());
    if (resU.ok) setUsers(await resU.json());
    if (resD.ok) setItems(await resD.json());
    if (resT.ok) { const data = await resT.json(); setTimezone(data.timezone); }
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
      setItems([...items, item]);
      setShow(false);
      setProj('');
      setService('');
      setExecutor('');
      setDeadline('');
      setMonthly(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select className="border p-1" value={filterProj} onChange={e => setFilterProj(e.target.value)}>
            <option value="">Все проекты</option>
            {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <select className="border p-1" value={filterService} onChange={e => setFilterService(e.target.value)}>
            <option value="">Все услуги</option>
            {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <select className="border p-1" value={filterExec} onChange={e => setFilterExec(e.target.value)}>
            <option value="">Все исполнители</option>
            {users.filter(u => u.role === 'digital').map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        <button className="px-2 py-1 border rounded" onClick={() => setShow(true)}>Добавить проект</button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">Проект</th>
            <th className="px-2 py-1 border">Вид услуги</th>
            <th className="px-2 py-1 border">Исполнитель</th>
            <th className="px-2 py-1 border">Время создания</th>
            <th className="px-2 py-1 border">Дедлайн</th>
          </tr>
        </thead>
        <tbody>
          {items.filter(it => (
            (!filterProj || it.project === filterProj) &&
            (!filterService || it.service === filterService) &&
            (!filterExec || it.executor === filterExec)
          )).map(it => (
            <tr key={it.id} className="text-center hover:bg-gray-50" onClick={() => navigate(String(it.id), { state: it })}>
              <td className="border px-2 py-1">{it.project}</td>
              <td className="border px-2 py-1">{it.service}</td>
              <td className="border px-2 py-1">{it.executor}</td>
              <td className="border px-2 py-1">{new Date(it.created_at.endsWith('Z') ? it.created_at : it.created_at + 'Z').toLocaleString('ru-RU', { timeZone: timezone })}</td>
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
