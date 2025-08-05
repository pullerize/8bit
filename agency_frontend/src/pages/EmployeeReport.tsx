import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../api'

interface User {
  id: number
  name: string
  role: string
  birth_date?: string | null
  contract_path?: string | null
}

interface Project { id: number; name: string }
interface Task {
  id: number
  title: string
  description?: string
  project?: string
  status: string
  created_at: string
  deadline?: string | null
  executor_id?: number
  author_id?: number
  task_type?: string
  task_format?: string
  finished_at?: string | null
  high_priority?: boolean
}

const ROLE_NAMES: Record<string, string> = {
  designer: 'Дизайнер',
  smm_manager: 'СММ-менеджер',
  head_smm: 'Head of SMM',
  admin: 'Администратор',
}

function firstDay(dt: Date) {
  return new Date(dt.getFullYear(), dt.getMonth(), 1)
}

function lastDay(dt: Date) {
  return new Date(dt.getFullYear(), dt.getMonth() + 1, 0)
}

function formatDate(d?: string | null) {
  if (!d) return ''
  const date = new Date(d)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function EmployeeReport() {
  const token = localStorage.getItem('token')
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  const [userId, setUserId] = useState('')
  const [project, setProject] = useState('')

  const now = new Date()
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'custom'>('custom')
  const [startDate, setStartDate] = useState(firstDay(now).toISOString().slice(0,10))
  const [endDate, setEndDate] = useState(lastDay(now).toISOString().slice(0,10))
  const [status, setStatus] = useState<'all' | 'in_progress' | 'done'>('all')

  const loadData = async () => {
    const headers = { Authorization: `Bearer ${token}` }
    const [u, p, t] = await Promise.all([
      fetch(`${API_URL}/users/`, { headers }).then(r=>r.json()),
      fetch(`${API_URL}/projects/`, { headers }).then(r=>r.json()),
      fetch(`${API_URL}/tasks/`, { headers }).then(r=>r.json()),
    ])
    setUsers(u)
    setProjects(p)
    setTasks(t)
  }

  useEffect(() => { loadData() }, [])

  const selectedUser = users.find(u => String(u.id) === userId)

  const handlePeriodChange = (p: 'day'|'week'|'month'|'custom') => {
    setPeriod(p)
    const base = new Date()
    if (p === 'day') {
      const iso = base.toISOString().slice(0,10)
      setStartDate(iso)
      setEndDate(iso)
    } else if (p === 'week') {
      const day = base.getDay()
      const diff = base.getDate() - (day === 0 ? 6 : day - 1)
      const monday = new Date(base.setDate(diff))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      setStartDate(monday.toISOString().slice(0,10))
      setEndDate(sunday.toISOString().slice(0,10))
    } else if (p === 'month') {
      setStartDate(firstDay(base).toISOString().slice(0,10))
      setEndDate(lastDay(base).toISOString().slice(0,10))
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (String(t.executor_id) !== userId) return false
    if (project && t.project !== project) return false
    const created = new Date(t.created_at).getTime()
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime() + 86400000 - 1
    if (created < start || created > end) return false
    if (status === 'in_progress' && t.status === 'done') return false
    if (status === 'done' && t.status !== 'done') return false
    return true
  }).sort((a,b)=>{
    const sa = a.status === 'done' ? 1 : 0
    const sb = b.status === 'done' ? 1 : 0
    if (sa !== sb) return sa - sb
    const da = new Date(a.deadline || a.created_at).getTime()
    const db = new Date(b.deadline || b.created_at).getTime()
    return da - db
  })

  const completedCount = tasks.filter(t => {
    if (String(t.executor_id) !== userId) return false
    if (project && t.project !== project) return false
    if (t.status !== 'done') return false
    const created = new Date(t.created_at).getTime()
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime() + 86400000 - 1
    return created >= start && created <= end
  }).length

  const getUserName = (id?: number) => {
    const u = users.find(x => x.id === id)
    return u ? u.name : ''
  }

  const uploadContract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId || !e.target.files?.length) return
    const file = e.target.files[0]
    const fd = new FormData()
    fd.append('file', file)
    await fetch(`${API_URL}/users/${userId}/contract`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    loadData()
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-x-2 mb-4">
        <Link to="/reports" className="px-2 py-1 border rounded">Отчеты по проектам</Link>
        <button className="px-2 py-1 border rounded bg-blue-500 text-white">Отчет по сотрудникам</button>
      </div>

      <h1 className="text-2xl mb-4">Отчет по сотрудникам</h1>

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <span className="text-sm text-gray-500">Период</span>
          <select className="border p-2" value={period} onChange={e=>handlePeriodChange(e.target.value as any)}>
            <option value="day">За день</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="custom">Кастомный</option>
          </select>
        </div>
        {period === 'custom' && (
          <>
            <input type="date" className="border p-2" value={startDate} onChange={e=>setStartDate(e.target.value)} />
            <input type="date" className="border p-2" value={endDate} onChange={e=>setEndDate(e.target.value)} />
          </>
        )}
        <select className="border p-2" value={userId} onChange={e=>setUserId(e.target.value)}>
          <option value="">Выберите сотрудника</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="border p-2" value={project} onChange={e=>setProject(e.target.value)}>
          <option value="">Все проекты</option>
          {projects.map(p=> <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
      </div>

      {selectedUser && (
        <div className="space-y-2 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-2 border rounded bg-white"><div className="text-sm text-gray-500">Имя</div><div>{selectedUser.name}</div></div>
            <div className="p-2 border rounded bg-white"><div className="text-sm text-gray-500">Должность</div><div>{ROLE_NAMES[selectedUser.role] || selectedUser.role}</div></div>
            <div className="p-2 border rounded bg-white">
              <div className="text-sm text-gray-500">Договор</div>
              {selectedUser.contract_path ? (
                <a href={`${API_URL}/users/${selectedUser.id}/contract`} className="text-blue-500 underline">Скачать</a>
              ) : (
                <input type="file" onChange={uploadContract} />
              )}
            </div>
            <div className="p-2 border rounded bg-white"><div className="text-sm text-gray-500">Завершенные задачи</div><div>{completedCount}</div></div>
          </div>

          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              <button
                className={`px-2 py-1 border rounded ${status==='all'?'bg-gray-200':''}`}
                onClick={()=>setStatus('all')}
              >Все задачи</button>
              <button
                className={`px-2 py-1 border rounded ${status==='in_progress'?'bg-gray-200':''}`}
                onClick={()=>setStatus('in_progress')}
              >В работе</button>
              <button
                className={`px-2 py-1 border rounded ${status==='done'?'bg-gray-200':''}`}
                onClick={()=>setStatus('done')}
              >Завершенные</button>
            </div>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Название задачи</th>
                  <th className="px-4 py-2 border">Проект</th>
                  <th className="px-4 py-2 border">Статус</th>
                  <th className="px-4 py-2 border">Когда поставлена задача</th>
                  <th className="px-4 py-2 border">Дедлайн</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(t => (
                  <tr key={t.id} className="text-center border-t cursor-pointer hover:bg-gray-50" onClick={()=>setModalTask(t)}>
                    <td className="px-4 py-2 border">{t.title}</td>
                    <td className="px-4 py-2 border">{t.project}</td>
                    <td className="px-4 py-2 border">{t.status === 'done' ? 'Завершено' : 'В работе'}</td>
                    <td className="px-4 py-2 border">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-2 border">{formatDate(t.deadline)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {modalTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded w-[40rem] max-h-[90vh] overflow-y-auto relative">
            <button className="absolute right-2 top-2" onClick={()=>setModalTask(null)}>✕</button>
            <h2 className="text-xl mb-2">Информация о задаче</h2>
            <div className="space-y-1">
              <div><span className="text-gray-500">Название:</span> {modalTask.title}</div>
              {modalTask.description && <div><span className="text-gray-500">Описание:</span> {modalTask.description}</div>}
              {modalTask.project && <div><span className="text-gray-500">Проект:</span> {modalTask.project}</div>}
              {modalTask.task_type && <div><span className="text-gray-500">Тип задачи:</span> {modalTask.task_type}</div>}
              {modalTask.task_format && <div><span className="text-gray-500">Формат:</span> {modalTask.task_format}</div>}
              <div><span className="text-gray-500">Кто поставил:</span> {getUserName(modalTask.author_id)}</div>
              <div><span className="text-gray-500">Исполнитель:</span> {getUserName(modalTask.executor_id)}</div>
              <div><span className="text-gray-500">Когда поставлена:</span> {formatDate(modalTask.created_at)}</div>
              {modalTask.deadline && <div><span className="text-gray-500">Дедлайн:</span> {formatDate(modalTask.deadline)}</div>}
              <div><span className="text-gray-500">Статус:</span> {modalTask.status === 'done' ? 'Завершено' : 'В работе'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeReport
