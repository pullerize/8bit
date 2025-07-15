import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../api'

interface Project {
  id: number
  name: string
}

interface PostSummary {
  in_progress: number
  approved: number
  cancelled: number
  overdue: number
}

function Donut({stats}:{stats:PostSummary}) {
  const total = stats.in_progress + stats.approved + stats.cancelled + stats.overdue
  const pApproved = total? stats.approved/total*100:0
  const pIn = total? stats.in_progress/total*100:0
  const pOver = total? stats.overdue/total*100:0
  const pCancel = total? stats.cancelled/total*100:0
  const bg = `conic-gradient(green 0 ${pApproved}%, yellow ${pApproved}% ${pApproved+pIn}%, red ${pApproved+pIn}% ${pApproved+pIn+pOver}%, gray ${pApproved+pIn+pOver}% 100%)`
  return <div className="w-32 h-32 rounded-full" style={{background:bg}} />
}

function Projects() {
  const [projects,setProjects]=useState<Project[]>([])
  const [stats,setStats]=useState<Record<number,PostSummary>>({})
  const token = localStorage.getItem('token')
  const navigate=useNavigate()

  const load = async () => {
    const res = await fetch(`${API_URL}/projects/`,{headers:{Authorization:`Bearer ${token}`}})
    if(res.ok){
      const data = await res.json()
      setProjects(data)
      const obj:Record<number,PostSummary>={}
      for(const p of data){
        const r = await fetch(`${API_URL}/projects/${p.id}/posts`,{headers:{Authorization:`Bearer ${token}`}})
        if(r.ok){
          const posts = await r.json()
          const sum:PostSummary={in_progress:0,approved:0,cancelled:0,overdue:0}
          for(const pt of posts){
            sum[pt.status as keyof PostSummary]++
          }
          obj[p.id]=sum
        } else {
          obj[p.id]={in_progress:0,approved:0,cancelled:0,overdue:0}
        }
      }
      setStats(obj)
    }
  }

  useEffect(()=>{load()},[])

  return (
    <div className="p-4">
      <h1 className="text-center text-xl mb-4">Общие показатели успеваемости по проектам</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {projects.map(p=> (
          <div key={p.id} className="border p-4 flex flex-col items-center cursor-pointer" onClick={()=>navigate(`/projects/${p.id}`)}>
            <Donut stats={stats[p.id]||{in_progress:0,approved:0,cancelled:0,overdue:0}} />
            <div className="mt-2 font-semibold">{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Projects
