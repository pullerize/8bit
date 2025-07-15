import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../api'

interface Post {
  id: number
  date: string
  posts_per_day: number
  post_type: string
  status: string
}

interface Project {
  id: number
  name: string
  posts_count: number
  start_date: string
  end_date: string
}

const statusColors: Record<string, string> = {
  in_progress: 'yellow',
  cancelled: 'gray',
  approved: 'green',
  overdue: 'red',
}

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

function ProjectDetail() {
  const { id } = useParams()
  const token = localStorage.getItem('token')

  const [project, setProject] = useState<Project | null>(null)
  const [name, setName] = useState('')
  const [postsCount, setPostsCount] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [posts, setPosts] = useState<Post[]>([])
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const [newDate, setNewDate] = useState('')
  const [newCount, setNewCount] = useState(1)
  const [newType, setNewType] = useState('video')
  const [newStatus, setNewStatus] = useState('in_progress')

  const load = async () => {
    const res = await fetch(`${API_URL}/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      setProject(data)
      setName(data.name)
      setPostsCount(data.posts_count)
      setStartDate(data.start_date?.slice(0, 10) || '')
      setEndDate(data.end_date?.slice(0, 10) || '')
    }
    const r = await fetch(`${API_URL}/projects/${id}/posts`, { headers: { Authorization: `Bearer ${token}` } })
    if (r.ok) setPosts(await r.json())
  }

  useEffect(() => { load() }, [id])

  const saveInfo = async () => {
    await fetch(`${API_URL}/projects/${id}/info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ posts_count: postsCount, start_date: startDate, end_date: endDate })
    })
    load()
  }

  const addPost = async () => {
    if (!newDate) return
    await fetch(`${API_URL}/projects/${id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        date: newDate + 'T00:00:00',
        posts_per_day: newCount,
        post_type: newType,
        status: newStatus
      })
    })
    setNewDate('')
    setNewCount(1)
    setNewType('video')
    setNewStatus('in_progress')
    load()
  }

  const filteredPosts = posts.filter(p => {
    const d = new Date(p.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })

  return (
    <div className="p-4 space-y-4">
      {project && (
        <div className="overflow-auto">
          <table className="min-w-full mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">Название проекта</th>
                <th className="px-2 py-1 border">Количество постов</th>
                <th className="px-2 py-1 border">Дата начала</th>
                <th className="px-2 py-1 border">Дата завершения</th>
                <th className="px-2 py-1 border"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1"><input className="border p-1 w-full" value={name} onChange={e=>setName(e.target.value)} /></td>
                <td className="border px-2 py-1"><input type="number" className="border p-1 w-full" value={postsCount} onChange={e=>setPostsCount(Number(e.target.value))} /></td>
                <td className="border px-2 py-1"><input type="date" className="border p-1 w-full" value={startDate} onChange={e=>setStartDate(e.target.value)} /></td>
                <td className="border px-2 py-1"><input type="date" className="border p-1 w-full" value={endDate} onChange={e=>setEndDate(e.target.value)} /></td>
                <td className="border px-2 py-1 text-center"><button className="px-2 py-1 border rounded" onClick={saveInfo}>Сохранить</button></td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-center gap-2 mb-2">
            <select className="border p-1" value={month} onChange={e=>setMonth(Number(e.target.value))}>
              {MONTHS.map((m,idx)=>(<option key={idx+1} value={idx+1}>{m}</option>))}
            </select>
            <select className="border p-1" value={year} onChange={e=>setYear(Number(e.target.value))}>
              {Array.from({length:5},(_,i)=>now.getFullYear()-2+i).map(y=>(<option key={y} value={y}>{y}</option>))}
            </select>
          </div>
        </div>
      )}

      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">Дата</th>
            <th className="px-2 py-1 border">Постов/день</th>
            <th className="px-2 py-1 border">Тип</th>
            <th className="px-2 py-1 border">Статус</th>
          </tr>
        </thead>
        <tbody>
          {filteredPosts.map(p => (
            <tr key={p.id} className="text-center border-t" style={{backgroundColor: statusColors[p.status]}}>
              <td className="border px-2 py-1">{p.date.slice(0,10)}</td>
              <td className="border px-2 py-1">{p.posts_per_day}</td>
              <td className="border px-2 py-1">{p.post_type}</td>
              <td className="border px-2 py-1">{p.status}</td>
            </tr>
          ))}
          <tr className="text-center border-t">
            <td className="border px-2 py-1"><input type="date" className="border p-1" value={newDate} onChange={e=>setNewDate(e.target.value)} /></td>
            <td className="border px-2 py-1"><input type="number" className="border p-1 w-16" value={newCount} onChange={e=>setNewCount(Number(e.target.value))} /></td>
            <td className="border px-2 py-1">
              <select className="border p-1" value={newType} onChange={e=>setNewType(e.target.value)}>
                <option value="video">Видео</option>
                <option value="static">Статика</option>
                <option value="carousel">Карусель</option>
              </select>
            </td>
            <td className="border px-2 py-1">
              <select className="border p-1" value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
                <option value="in_progress">В работе</option>
                <option value="approved">Утвержден</option>
                <option value="cancelled">Отменен</option>
                <option value="overdue">Просрочено</option>
              </select>
            </td>
            <td className="border px-2 py-1">
              <button className="px-2 py-1 border rounded" onClick={addPost}>Добавить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ProjectDetail
