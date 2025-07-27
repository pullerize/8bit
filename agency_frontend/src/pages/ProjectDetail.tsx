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

// Row border colors based on post status
const statusColors: Record<string, string> = {
  in_progress: '#ffd700', // yellow
  cancelled: '#808080',   // grey
  approved: '#008000',    // green
  overdue: '#ff0000',     // red
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
  const [month,setMonth] = useState(new Date().getMonth()+1)

  const [posts, setPosts] = useState<Post[]>([])
  const [drafts, setDrafts] = useState<Post[]>([])
  const [loaded, setLoaded] = useState(false)


  const load = async (m:number=month) => {
    const res = await fetch(`${API_URL}/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      setProject(data)
      setName(data.name)
      setPostsCount(data.posts_count)
      setStartDate(data.start_date?.slice(0, 10) || '')
      setEndDate(data.end_date?.slice(0, 10) || '')
    }
    let year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear()
    const nextMonth = m === 12 ? 1 : m + 1
    const nextYear = nextMonth === 1 ? year + 1 : year
    const first = await fetch(`${API_URL}/projects/${id}/posts?month=${m}&year=${year}`, { headers: { Authorization: `Bearer ${token}` } })
    const second = await fetch(`${API_URL}/projects/${id}/posts?month=${nextMonth}&year=${nextYear}`, { headers: { Authorization: `Bearer ${token}` } })
    const list1 = first.ok ? await first.json() : []
    const list2 = second.ok ? await second.json() : []
    setPosts([...list1, ...list2])
    setLoaded(true)
  }

  useEffect(() => { load(month) }, [id, month])

  useEffect(() => {
    if (!loaded || !startDate) return
    const d = new Date(startDate)
    const year = d.getFullYear()
    const day = d.getDate()
    const newStart = new Date(year, month - 1, day)
    const newEnd = new Date(newStart)
    newEnd.setMonth(newEnd.getMonth() + 1)
    const s = newStart.toISOString().slice(0, 10)
    const e = newEnd.toISOString().slice(0, 10)
    setStartDate(s)
    setEndDate(e)
    updateInfo({ start_date: s, end_date: e })
  }, [month])

  // month/year selectors no longer reset start and end dates automatically

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
      setPosts(posts.map((p) => (p.id === post.id ? updated : p)))
      const res = await fetch(`${API_URL}/project_posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: (updated.date.includes('T') ? updated.date : updated.date + 'T00:00:00'),
          posts_per_day: updated.posts_per_day,
          post_type: updated.post_type,
          status: updated.status,
        }),
      })
      if (res.ok) {
        const saved = await res.json()
        setPosts(posts.map((p) => (p.id === post.id ? saved : p)))
      } else {
        // keep optimistic value
      }
    }
  }

  const addRow = () => {
    setDrafts([...drafts, { id: 0, date: '', posts_per_day: 1, post_type: 'video', status: 'in_progress' }])
  }

  const removeRow = async (idx: number, post: Post) => {
    if (post.id === 0) {
      const copy = drafts.filter((_, i) => i !== idx - filteredPosts.length)
      setDrafts(copy)
    } else {
      await fetch(`${API_URL}/project_posts/${post.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      setPosts(posts.filter(p => p.id !== post.id))
    }
  }

  const filteredPosts = posts.filter(p => {
    const d = new Date(p.date)
    const sd = startDate ? new Date(startDate) : null
    const ed = endDate ? new Date(endDate) : null
    if (sd && d < sd) return false
    if (ed && d >= ed) return false
    if (d.getMonth()+1 !== month) return false
    return true
  })

  const recalcPostsCount = async (list?: Post[], dr?: Post[]) => {
    const sd = startDate ? new Date(startDate) : null
    const ed = endDate ? new Date(endDate) : null
    const relevant = (list || posts).filter(p => {
      const d = new Date(p.date)
      if (sd && d < sd) return false
      if (ed && d >= ed) return false
      if (d.getMonth()+1 !== month) return false
      return true
    })
    const totalExisting = relevant.reduce((sum, p) => sum + p.posts_per_day, 0)
    const draftSum = (dr || drafts).reduce((sum, d) => sum + d.posts_per_day, 0)
    const total = totalExisting + draftSum
    setPostsCount(total)
    await fetch(`${API_URL}/projects/${id}/info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ posts_count: total })
    })
  }

  useEffect(() => {
    if (loaded) recalcPostsCount()
  }, [posts, drafts, startDate, endDate, month, loaded])

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
                <td className="border px-2 py-1">{name}</td>
                <td className="border px-2 py-1">{postsCount}</td>
                <td className="border px-2 py-1"><input type="date" className="border p-1 w-full" value={startDate} onChange={e=>setStartDate(e.target.value)} onBlur={()=>updateInfo({start_date:startDate})} /></td>
                <td className="border px-2 py-1"><input type="date" className="border p-1 w-full" value={endDate} onChange={e=>setEndDate(e.target.value)} onBlur={()=>updateInfo({end_date:endDate})} /></td>
                <td className="border px-2 py-1"></td>
              </tr>
          </tbody>
        </table>
        <div className="mb-4">
          <select className="border p-1" value={month} onChange={e=>setMonth(Number(e.target.value))}>
            {MONTHS.map((m,i)=>(<option key={i+1} value={i+1}>{m}</option>))}
          </select>
        </div>
          {/* Month and year selectors were previously used to reset dates automatically. */}
        </div>
      )}

      <table className="min-w-full bg-white border-separate border-spacing-y-2 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">Дата</th>
            <th className="px-2 py-1 border">Постов/день</th>
            <th className="px-2 py-1 border">Тип</th>
            <th className="px-2 py-1 border">Статус</th>
            <th className="px-2 py-1 border w-8"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, idx) => (
            <tr
              key={p.id || `new-${idx}`}
              className="text-center"
              style={{ border: `2px solid ${statusColors[p.status]}` }}
            >
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
              <td className="border px-2 py-1">
                <button
                  className="px-2 py-1 border rounded text-lg"
                  onClick={() => removeRow(idx, p)}
                >
                  -
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={5} className="text-center border">
              <button className="px-2 py-1 border rounded" onClick={addRow}>Добавить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ProjectDetail
