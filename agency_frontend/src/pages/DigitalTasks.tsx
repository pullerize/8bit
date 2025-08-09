import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import DigitalProject from './DigitalProject';

interface ProjectOption { id: number; name: string }
interface Service { id: number; name: string }
interface User { id: number; name: string; role: string }

interface DigitalItem {
  id: number;
  project_id: number;
  project: string;
  service_id: number;
  service: string;
  executor_id: number;
  executor: string;
  created_at: string;
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
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [monthly, setMonthly] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [filterProj, setFilterProj] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterExec, setFilterExec] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [customDate, setCustomDate] = useState('');
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

  const save = async () => {
    if (!proj || !service || !executor) return;
    const deadline = monthly || !deadlineDate || !deadlineTime ? null : `${deadlineDate}T${deadlineTime}`;
    const payload = {
      project_id: Number(proj),
      service_id: Number(service),
      executor_id: Number(executor),
      deadline,
      monthly
    };
    const url = editId ? `${API_URL}/digital/projects/${editId}` : `${API_URL}/digital/projects`;
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const item = await res.json();
      if (editId) {
        setItems(items.map(i => (i.id === editId ? item : i)));
      } else {
        setItems([...items, item]);
      }
      setShow(false);
      setProj('');
      setService('');
      setExecutor('');
      setDeadlineDate('');
      setDeadlineTime('');
      setMonthly(false);
      setEditId(null);
    }
  };

  const remove = async (id: number) => {
    await fetch(`${API_URL}/digital/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setItems(items.filter(i => i.id !== id));
    if (editId === id) setShow(false);
  };

  const handleTimeChange = (val: string) => {
    let v = val.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2);
    setDeadlineTime(v);
  };

  const openAdd = () => {
    setEditId(null);
    setProj('');
    setService('');
    setExecutor('');
    setDeadlineDate('');
    setDeadlineTime('');
    setMonthly(false);
    setShow(true);
  };

  const openEdit = (it: DigitalItem) => {
    setEditId(it.id);
    setProj(String(it.project_id));
    setService(String(it.service_id));
    setExecutor(String(it.executor_id));
    if (it.deadline) {
      const d = new Date(it.deadline);
      setDeadlineDate(d.toISOString().slice(0, 10));
      setDeadlineTime(d.toISOString().slice(11, 16));
    } else {
      setDeadlineDate('');
      setDeadlineTime('');
    }
    setMonthly(it.monthly);
    setShow(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap items-center">
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
        <button className="px-2 py-1 border rounded" onClick={openAdd}>Добавить проект</button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">Проект</th>
            <th className="px-2 py-1 border">Вид услуги</th>
            <th className="px-2 py-1 border">Исполнитель</th>
            <th className="px-2 py-1 border">Время создания</th>
            <th className="px-2 py-1 border">Дедлайн</th>
            <th className="px-2 py-1 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.filter(it => {
            if (filterProj && it.project !== filterProj) return false;
            if (filterService && it.service !== filterService) return false;
            if (filterExec && it.executor !== filterExec) return false;
            const created = new Date(it.created_at.endsWith('Z') ? it.created_at : it.created_at + 'Z');
            if (filterDate === 'today') {
              const now = new Date();
              if (created.toDateString() !== now.toDateString()) return false;
            } else if (filterDate === 'week') {
              if (Date.now() - created.getTime() > 7 * 86400000) return false;
            } else if (filterDate === 'month') {
              if (Date.now() - created.getTime() > 30 * 86400000) return false;
            } else if (filterDate === 'custom' && customDate) {
              const sel = new Date(customDate);
              if (created.toDateString() !== sel.toDateString()) return false;
            }
            return true;
          }).map(it => (
            <tr key={it.id} className="text-center hover:bg-gray-50" onClick={() => navigate(String(it.id), { state: it })}>
              <td className="border px-2 py-1">{it.project}</td>
              <td className="border px-2 py-1">{it.service}</td>
              <td className="border px-2 py-1">{it.executor}</td>
              <td className="border px-2 py-1">{new Date(it.created_at.endsWith('Z') ? it.created_at : it.created_at + 'Z').toLocaleString('ru-RU', { timeZone: timezone })}</td>
              <td className="border px-2 py-1">{it.monthly ? 'Ежемесячно' : it.deadline ? timeLeft(it.deadline) : ''}</td>
              <td className="border px-2 py-1 space-x-2" onClick={e => e.stopPropagation()}>
                <button className="text-blue-500" onClick={() => openEdit(it)}>Редактировать</button>
                <button className="text-green-600" onClick={() => remove(it.id)}>Завершено</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[32rem] space-y-2">
            <h3 className="text-lg mb-2">{editId ? 'Редактировать проект' : 'Новый проект'}</h3>
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
              <div className="flex gap-2">
                <input type="date" className="border p-2 flex-1" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} />
                <input className="border p-2 w-24" placeholder="00:00" value={deadlineTime} onChange={e => handleTimeChange(e.target.value)} />
              </div>
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={monthly} onChange={e => setMonthly(e.target.checked)} />
              Ежемесячно
            </label>
            <div className="text-right space-x-2">
              <button className="px-3 py-1 border rounded" onClick={() => { setShow(false); setEditId(null); }}>Отмена</button>
              {editId && <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => remove(editId)}>Удалить</button>}
              <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={save}>Сохранить</button>
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
