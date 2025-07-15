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

const statusColors:Record<string,string>={
  in_progress:'yellow',
  cancelled:'gray',
  approved:'green',
  overdue:'red'
}

function ProjectDetail() {
  const {id}=useParams()
  const [project,setProject]=useState<Project|null>(null)
  const [posts,setPosts]=useState<Post[]>([])
  const token=localStorage.getItem('token')

  const load=async()=>{
    const res = await fetch(`${API_URL}/projects/${id}`,{headers:{Authorization:`Bearer ${token}`}})
    if(res.ok) setProject(await res.json())
    const r = await fetch(`${API_URL}/projects/${id}/posts`,{headers:{Authorization:`Bearer ${token}`}})
    if(r.ok) setPosts(await r.json())
  }

  useEffect(()=>{load()},[id])

  return (
    <div className="p-4 space-y-4">
      {project && (
        <div className="space-y-2">
          <h1 className="text-xl">{project.name}</h1>
          <div>Количество постов: {project.posts_count}</div>
          <div>Дата начала: {project.start_date?.slice(0,10)}</div>
          <div>Дата завершения: {project.end_date?.slice(0,10)}</div>
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
          {posts.map(p=> (
            <tr key={p.id} className="text-center border-t" style={{backgroundColor:statusColors[p.status]}}>
              <td className="border px-2 py-1">{p.date.slice(0,10)}</td>
              <td className="border px-2 py-1">{p.posts_per_day}</td>
              <td className="border px-2 py-1">{p.post_type}</td>
              <td className="border px-2 py-1">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProjectDetail
