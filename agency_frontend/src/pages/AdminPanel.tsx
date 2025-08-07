import { useState } from 'react'
import Users from './Users'
import Operators from './Operators'
import Projects from './ProjectsAdmin'
import ExpensesAdmin from './ExpensesAdmin'
import Taxes from './Taxes'

function AdminPanel() {
  const [tab, setTab] = useState<'users'|'operators'|'projects'|'expenses'|'taxes'>('users')

  return (
    <div className="p-4 space-y-4">
      <div className="space-x-4">
        <button className={`px-2 py-1 border rounded ${tab==='users'&&'bg-gray-200'}`} onClick={()=>setTab('users')}>Пользователи</button>
        <button className={`px-2 py-1 border rounded ${tab==='operators'&&'bg-gray-200'}`} onClick={()=>setTab('operators')}>Операторы</button>
        <button className={`px-2 py-1 border rounded ${tab==='projects'&&'bg-gray-200'}`} onClick={()=>setTab('projects')}>Проекты</button>
        <button className={`px-2 py-1 border rounded ${tab==='expenses'&&'bg-gray-200'}`} onClick={()=>setTab('expenses')}>Расходы</button>
        <button className={`px-2 py-1 border rounded ${tab==='taxes'&&'bg-gray-200'}`} onClick={()=>setTab('taxes')}>Налоги</button>
      </div>
      {tab === 'users' && <Users />}
      {tab === 'operators' && <Operators />}
      {tab === 'projects' && <Projects />}
      {tab === 'expenses' && <ExpensesAdmin />}
      {tab === 'taxes' && <Taxes />}
    </div>
  )
}

export default AdminPanel
