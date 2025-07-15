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
  in_progress: '#d4a017',
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
  const [drafts, setDrafts] = useState<Post[]>([])
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [loaded, setLoaded] = useState(false)
  const [initialized, setInitialized] = useState(false)


  const load = async () => {
    const res = await fetch(`${API_URL}/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      setProject(data)
      setName(data.name)
      setPostsCount(data.posts_count)
      setStartDate(data.start_date?.slice(0, 10) || '')
      setEndDate(data.end_date?.slice(0, 10) || '')
      if (data.start_date) {
        const d = new Date(data.start_date)
        setMonth(d.getMonth() + 1)
        setYear(d.getFullYear())
      }
    }
    const r = await fetch(`${API_URL}/projects/${id}/posts`, { headers: { Authorization: `Bearer ${token}` } })
    if (r.ok) setPosts(await r.json())
    setLoaded(true)
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    if (!loaded) return
    if (!initialized) {
      setInitialized(true)
      return
    }
    const start = new Date(Date.UTC(year, month - 1, 1))
    const end = new Date(Date.UTC(year, month, 1))
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)
    setPostsCount(0)
    setStartDate(startStr)
    setEndDate(endStr)
    setDrafts([])
    updateInfo({ posts_count: 0, start_date: startStr, end_date: endStr })
  }, [month, year, loaded, initialized])

  const updateInfo = async (data: Partial<{name:string;posts_count:number;start_date:string;end_date:string}>) => {
    if ('name' in data) {
      await fetch(`${API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: data.name })
      })
    }
    const payload: any = {}
    if ('posts_count' in data) payload.posts_count = data.posts_count
    if ('start_date' in data) payload.start_date = data.start_date
    if ('end_date' in data) payload.end_date = data.end_date
    if (Object.keys(payload).length) {
      await fetch(`${API_URL}/projects/${id}/info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
    }
    load()
  }

  const updatePost = async (idx: number, post: Post, field: string, value: any) => {
    const updated = { ...post, [field]: value }
    if (post.id === 0) {
      const draftsCopy = [...drafts]
      draftsCopy[idx - filteredPosts.length] = updated
      setDrafts(draftsCopy)
      if (field === 'date' && value) {
        const res = await fetch(`${API_URL}/projects/${id}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            date: value + 'T00:00:00',
            posts_per_day: updated.posts_per_day,
            post_type: updated.post_type,
            status: updated.status,
          })
        })
        if (res.ok) {
          const created = await res.json()
          setPosts([...posts, created])
          draftsCopy.splice(idx - filteredPosts.length, 1)
          setDrafts(draftsCopy)
          load()
        }
      }
    } else {
      await fetch(`${API_URL}/project_posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: updated.date + 'T00:00:00',
          posts_per_day: updated.posts_per_day,
          post_type: updated.post_type,
          status: updated.status,
        })
      })
      setPosts(posts.map(p => p.id === post.id ? updated : p))
      load()
    }
  }

  const filteredPosts = posts.filter(p => {
    const d = new Date(p.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })

  useEffect(() => {
    if (!loaded) return
    const relevant = posts.filter(p => {
      const d = new Date(p.date)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
    const total = relevant.reduce((sum, p) => sum + p.posts_per_day, 0)
    const needed = Math.max(0, postsCount - total)
    setDrafts(Array.from({ length: needed }, () => ({
      id: 0,
      date: '',
      posts_per_day: 1,
      post_type: 'video',
      status: 'in_progress',
    })))
  }, [postsCount, posts, month, year, loaded])

  const rows = [...filteredPosts, ...drafts]

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
                <td className="border px-2 py-1"><input className="border p-1 w-full" value={name} onChange={e=>setName(e.target.value)} onBlur={()=>updateInfo({name})} /></td>
                <td className="border px-2 py-1"><input type="number" className="border p-1 w-full" value={postsCount} onChange={e=>setPostsCount(Number(e.target.value))} onBlur={()=>updateInfo({posts_count: postsCount})} /></td>
                <td className="border px-2 py-1"><input type="date" className="border p-1 w-full" value={startDate} onChange={e=>setStartDate(e.target.value)} onBlur={()=>updateInfo({start_date:startDate})} /></td>
                <td className="border px-2 py-1"><input type="date" className="border p-1 w-full" value={endDate} onChange={e=>setEndDate(e.target.value)} onBlur={()=>updateInfo({end_date:endDate})} /></td>
                <td className="border px-2 py-1"></td>
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
          {rows.map((p, idx) => (
            <tr key={p.id || `new-${idx}`} className="text-center border-t" style={{borderColor: statusColors[p.status], borderWidth: '2px'}}>
              <td className="border px-2 py-1">
                <input type="date" className="border p-1" value={p.date ? p.date.slice(0,10) : ''} onChange={e=>updatePost(idx, p, 'date', e.target.value)} />
              </td>
              <td className="border px-2 py-1">
                <input type="number" className="border p-1 w-16" value={p.posts_per_day} onChange={e=>updatePost(idx, p, 'posts_per_day', Number(e.target.value))} />
              </td>
              <td className="border px-2 py-1">
                <select className="border p-1" value={p.post_type} onChange={e=>updatePost(idx, p, 'post_type', e.target.value)}>
                  <option value="video">Видео</option>
                  <option value="static">Статика</option>
                  <option value="carousel">Карусель</option>
                </select>
              </td>
              <td className="border px-2 py-1">
                <select className="border p-1" value={p.status} onChange={e=>updatePost(idx, p, 'status', e.target.value)}>
                  {p.status === 'overdue' && <option value="overdue" disabled>Просрочено</option>}
                  <option value="in_progress">В работе</option>
                  <option value="approved">Утвержден</option>
                  <option value="cancelled">Отменен</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProjectDetail
