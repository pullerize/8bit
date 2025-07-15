import { useEffect, useState } from 'react'
import { API_URL } from '../api'

interface Project { id: number; name: string }
interface Expense { id: number; name: string; amount: number; comment?: string }
interface Report {
  project_id: number
  contract_amount: number
  receipts: number
  total_expenses: number
  debt: number
  balance_after_tax: number
  positive_balance: number
  expenses: Expense[]
}

function Reports() {
  const token = localStorage.getItem('token')
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState<number | ''>('')
  const [report, setReport] = useState<Report | null>(null)

  const loadProjects = async () => {
    const res = await fetch(`${API_URL}/projects/`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setProjects(await res.json())
  }

  const loadReport = async (pid: number) => {
    const res = await fetch(`${API_URL}/projects/${pid}/report`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setReport(await res.json())
  }

  useEffect(() => { loadProjects() }, [])
  useEffect(() => { if (projectId) loadReport(projectId as number) }, [projectId])

  const editField = async (field: 'contract_amount' | 'receipts') => {
    if (!projectId) return
    const val = prompt('Введите сумму', String(report ? report[field] : 0))
    if (val === null) return
    await fetch(`${API_URL}/projects/${projectId}/report`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ [field]: parseFloat(val) || 0 })
    })
    loadReport(projectId as number)
  }

  const addExpense = async () => {
    if (!projectId) return
    const name = prompt('Наименование расхода')
    if (!name) return
    const amountStr = prompt('Сумма')
    if (!amountStr) return
    const comment = prompt('Комментарий') || ''
    await fetch(`${API_URL}/projects/${projectId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, amount: parseFloat(amountStr), comment })
    })
    loadReport(projectId as number)
  }

  const deleteExpense = async (id: number) => {
    await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (projectId) loadReport(projectId as number)
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl mb-4">Отчеты по проектам</h1>
      <select className="border p-2" value={projectId} onChange={e => setProjectId(Number(e.target.value))}>
        <option value="">Выберите проект</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-2 border rounded cursor-pointer" onClick={() => editField('contract_amount')}>
              <div className="text-sm text-gray-500">Сумма контракта</div>
              <div className="text-lg font-semibold">{report.contract_amount}</div>
            </div>
            <div className="p-2 border rounded cursor-pointer" onClick={() => editField('receipts')}>
              <div className="text-sm text-gray-500">Поступления</div>
              <div className="text-lg font-semibold">{report.receipts}</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-sm text-gray-500">Долг</div>
              <div className="text-lg font-semibold">{report.debt}</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-sm text-gray-500">Баланс после вычета налога</div>
              <div className="text-lg font-semibold">{report.balance_after_tax}</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-sm text-gray-500">Общий расход</div>
              <div className="text-lg font-semibold">{report.total_expenses}</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-sm text-gray-500">Положительный баланс</div>
              <div className="text-lg font-semibold">{report.positive_balance}</div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-xl">Расходы</h2>
            <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={addExpense}>Добавить расходы</button>
          </div>
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Наименование расходов</th>
                <th className="px-4 py-2 border">Расход</th>
                <th className="px-4 py-2 border">Комментарий</th>
                <th className="px-4 py-2 border"></th>
              </tr>
            </thead>
            <tbody>
              {report.expenses.map(e => (
                <tr key={e.id} className="text-center border-t">
                  <td className="px-4 py-2 border">{e.name}</td>
                  <td className="px-4 py-2 border">{e.amount}</td>
                  <td className="px-4 py-2 border">{e.comment}</td>
                  <td className="px-4 py-2 border">
                    <button className="text-red-500" onClick={() => deleteExpense(e.id)}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default Reports
