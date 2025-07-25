import { useEffect, useState } from 'react'
import { API_URL } from '../api'

const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

interface Project { id: number; name: string }
interface Expense { id: number; name: string; amount: number; comment?: string }
interface Receipt { id: number; name: string; amount: number; comment?: string }
interface ClientExpense { id: number; name: string; amount: number; comment?: string }
interface Report {
  project_id: number
  contract_amount: number
  receipts: number
  total_expenses: number
  debt: number
  balance_after_tax: number
  positive_balance: number
  expenses: Expense[]
  receipts_list: Receipt[]
  client_expenses: ClientExpense[]
}

function formatCurrency(n: number) {
  return n.toLocaleString('ru-RU') + ' сум'
}

function formatInput(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function parseNumber(value: string) {
  return parseFloat(value.replace(/[^0-9.,]/g, '').replace(/\s+/g, '').replace(',', '.')) || 0
}

function Reports() {
  const token = localStorage.getItem('token')
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState<number | ''>('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [report, setReport] = useState<Report | null>(null)

  const [modal, setModal] = useState<'' | 'contract_amount' | 'expense' | 'receipt' | 'client_expense' | 'close_client_expense'>('')
  const [fieldValue, setFieldValue] = useState('')
  const [expName, setExpName] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expComment, setExpComment] = useState('')
  const [recName, setRecName] = useState('')
  const [recAmount, setRecAmount] = useState('')
  const [recComment, setRecComment] = useState('')
  const [cExpName, setCExpName] = useState('')
  const [cExpAmount, setCExpAmount] = useState('')
  const [cExpComment, setCExpComment] = useState('')
  const [closeAmount, setCloseAmount] = useState('')
  const [closeComment, setCloseComment] = useState('')
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null)
  const [editingClientExpense, setEditingClientExpense] = useState<ClientExpense | null>(null)
  const [tab, setTab] = useState<'expenses' | 'receipts' | 'client_expenses'>('expenses')

  const loadProjects = async () => {
    const res = await fetch(`${API_URL}/projects/`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setProjects(await res.json())
  }

  const loadReport = async (pid: number, m: number = month) => {
    const res = await fetch(`${API_URL}/projects/${pid}/report?month=${m}`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setReport(await res.json())
  }

  useEffect(() => { loadProjects() }, [])
  useEffect(() => { if (projectId) loadReport(projectId as number, month) }, [projectId, month])

  const openEditField = (field: 'contract_amount') => {
    setFieldValue(report ? formatInput(String(report[field])) : '')
    setModal(field)
  }

  const submitField = async () => {
    if (!projectId || !modal) return
    const res = await fetch(`${API_URL}/projects/${projectId}/report?month=${month}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ [modal]: parseNumber(fieldValue) })
    })
    setModal('')
    if (res.ok) {
      const data = await res.json()
      setReport(data)
    } else {
      loadReport(projectId as number, month)
    }
  }

  const openExpense = (e?: Expense) => {
    if (e) {
      setEditingExpense(e)
      setExpName(e.name)
      setExpAmount(formatInput(String(e.amount)))
      setExpComment(e.comment || '')
    } else {
      setEditingExpense(null)
      setExpName('')
      setExpAmount('')
      setExpComment('')
    }
    setModal('expense')
  }

  const openReceipt = (r?: Receipt) => {
    if (r) {
      setEditingReceipt(r)
      setRecName(r.name)
      setRecAmount(formatInput(String(r.amount)))
      setRecComment(r.comment || '')
    } else {
      setEditingReceipt(null)
      setRecName('')
      setRecAmount('')
      setRecComment('')
    }
    setModal('receipt')
  }

  const openClientExpense = (e?: ClientExpense) => {
    if (e) {
      setEditingClientExpense(e)
      setCExpName(e.name)
      setCExpAmount(formatInput(String(e.amount)))
      setCExpComment(e.comment || '')
    } else {
      setEditingClientExpense(null)
      setCExpName('')
      setCExpAmount('')
      setCExpComment('')
    }
    setModal('client_expense')
  }

  const openCloseClientExpense = (e: ClientExpense) => {
    setEditingClientExpense(e)
    setCloseAmount(formatInput(String(e.amount)))
    setCloseComment(e.comment || '')
    setModal('close_client_expense')
  }

  const submitExpense = async () => {
    if (!projectId) return
    const url = editingExpense
      ? `${API_URL}/expenses/${editingExpense.id}`
      : `${API_URL}/projects/${projectId}/expenses?month=${month}`
    const method = editingExpense ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: expName, amount: parseNumber(expAmount), comment: expComment })
    })
    setModal('')
    if (res.ok) {
      const exp: Expense = await res.json()
      setReport(r => {
        if (!r) return r
        let expenses = r.expenses
        let total = r.total_expenses
        if (editingExpense) {
          expenses = expenses.map(x => x.id === exp.id ? exp : x)
          total = total - editingExpense.amount + exp.amount
        } else {
          expenses = [...expenses, exp]
          total = total + exp.amount
        }
        const positive_balance = r.contract_amount * 0.83 - total
        return {
          ...r,
          expenses,
          total_expenses: total,
          positive_balance,
        }
      })
      setEditingExpense(null)
    } else {
      loadReport(projectId as number, month)
    }
  }

  const submitReceipt = async () => {
    if (!projectId) return
    const url = editingReceipt
      ? `${API_URL}/receipts/${editingReceipt.id}`
      : `${API_URL}/projects/${projectId}/receipts?month=${month}`
    const method = editingReceipt ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: recName, amount: parseNumber(recAmount), comment: recComment })
    })
    setModal('')
    if (res.ok) {
      const item: Receipt = await res.json()
      setReport(r => {
        if (!r) return r
        let list = r.receipts_list
        let sum = r.receipts
        if (editingReceipt) {
          list = list.map(x => x.id === item.id ? item : x)
          sum = sum - editingReceipt.amount + item.amount
        } else {
          list = [...list, item]
          sum = sum + item.amount
        }
       const balance_after_tax = sum * 0.83
        const positive_balance = r.contract_amount * 0.83 - r.total_expenses
        const clientSum = r.client_expenses.reduce((s,x)=>s+x.amount,0)
        const debt = r.contract_amount - sum + clientSum
        return { ...r, receipts: sum, receipts_list: list, balance_after_tax, positive_balance, debt }
      })
      setEditingReceipt(null)
    } else {
      loadReport(projectId as number, month)
    }
  }

  const submitClientExpense = async () => {
    if (!projectId) return
    const url = editingClientExpense
      ? `${API_URL}/client_expenses/${editingClientExpense.id}`
      : `${API_URL}/projects/${projectId}/client_expenses?month=${month}`
    const method = editingClientExpense ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: cExpName, amount: parseNumber(cExpAmount), comment: cExpComment })
    })
    setModal('')
    if (res.ok) {
      const item: ClientExpense = await res.json()
      setReport(r => {
        if (!r) return r
        let list = r.client_expenses
        let total = r.total_expenses
        if (editingClientExpense) {
          list = list.map(x => x.id === item.id ? item : x)
          total = total - editingClientExpense.amount + item.amount
        } else {
          list = [...list, item]
          total = total + item.amount
        }
        const clientSum = list.reduce((s,x)=>s+x.amount,0)
        const debt = r.contract_amount - r.receipts + clientSum
        const positive_balance = r.contract_amount * 0.83 - total
        return { ...r, client_expenses: list, debt, total_expenses: total, positive_balance }
      })
      setEditingClientExpense(null)
    } else {
      loadReport(projectId as number, month)
    }
  }

  const closeClientExpense = async () => {
    if (!editingClientExpense) return
    const res = await fetch(`${API_URL}/client_expenses/${editingClientExpense.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount: parseNumber(closeAmount), comment: closeComment })
    })
    setModal('')
    if (res.ok) {
      const item = await res.json()
      setReport(r => {
        if (!r) return r
        let list = r.client_expenses
        let total = r.total_expenses
        if (item) {
          list = list.map(x => x.id === item.id ? item : x)
          total = total - editingClientExpense.amount + item.amount
        } else {
          list = list.filter(x => x.id !== editingClientExpense.id)
          total = total - editingClientExpense.amount
        }
        const clientSum = list.reduce((s,x)=>s+x.amount,0)
        const debt = r.contract_amount - r.receipts + clientSum
        const positive_balance = r.contract_amount * 0.83 - total
        return { ...r, client_expenses: list, debt, total_expenses: total, positive_balance }
      })
      setEditingClientExpense(null)
    } else {
      loadReport(projectId as number, month)
    }
  }


  const deleteExpense = async (id: number) => {
    await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (projectId) loadReport(projectId as number, month)
  }

  const deleteReceipt = async (id: number) => {
    await fetch(`${API_URL}/receipts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (projectId) loadReport(projectId as number, month)
  }

  const deleteClientExpense = async (id: number) => {
    await fetch(`${API_URL}/client_expenses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (projectId) loadReport(projectId as number, month)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-x-2 mb-4">
        <button className="px-2 py-1 border rounded bg-blue-500 text-white">Отчеты по проектам</button>
        <button className="px-2 py-1 border rounded">Отчеты по сотрудникам</button>
        <button className="px-2 py-1 border rounded">Общие показатели успеваемости проектов</button>
      </div>
      <h1 className="text-2xl mb-4">Отчеты по проектам</h1>
      <div className="flex space-x-2">
        <select className="border p-2" value={projectId} onChange={e => setProjectId(Number(e.target.value))}>
          <option value="">Выберите проект</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="border p-2" value={month} onChange={e => setMonth(Number(e.target.value))}>
          {MONTH_NAMES.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
      </div>
      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-2 border rounded bg-white cursor-pointer" onClick={() => openEditField('contract_amount')}>
              <div className="text-sm text-gray-500">Сумма контракта</div>
              <div className="text-lg font-semibold">{formatCurrency(report.contract_amount)}</div>
            </div>
            <div className="p-2 border rounded bg-white">
              <div className="text-sm text-gray-500">Поступления</div>
              <div className="text-lg font-semibold">{formatCurrency(report.receipts)}</div>
            </div>
            <div className="p-2 border rounded border-red-500 bg-gray-50">
              <div className="text-sm text-gray-500">Долг</div>
              <div className="text-lg font-semibold">{formatCurrency(report.debt)}</div>
            </div>
            <div className="p-2 border rounded bg-gray-50">
              <div className="text-sm text-gray-500">Баланс после вычета налога</div>
              <div className="text-lg font-semibold">{formatCurrency(report.balance_after_tax)}</div>
            </div>
            <div className="p-2 border rounded bg-gray-50">
              <div className="text-sm text-gray-500">Общий расход</div>
              <div className="text-lg font-semibold">{formatCurrency(report.total_expenses)}</div>
            </div>
            <div className="p-2 border rounded border-green-500 bg-gray-50">
              <div className="text-sm text-gray-500">Положительный баланс</div>
              <div className="text-lg font-semibold">{formatCurrency(report.positive_balance)}</div>
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            <button className={`px-2 py-1 border rounded ${tab==='receipts' ? 'bg-gray-200' : ''}`} onClick={()=>setTab('receipts')}>Поступления</button>
            <button className={`px-2 py-1 border rounded ${tab==='expenses' ? 'bg-gray-200' : ''}`} onClick={()=>setTab('expenses')}>Расходы</button>
            <button className={`px-2 py-1 border rounded ${tab==='client_expenses' ? 'bg-gray-200' : ''}`} onClick={()=>setTab('client_expenses')}>Клиентские расходы</button>
          </div>

          {tab === 'expenses' && (
            <>
              <div className="flex justify-between items-center mt-4">
                <h2 className="text-xl">Расходы</h2>
                <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => openExpense()}>Добавить</button>
              </div>
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Наименование расходов</th>
                    <th className="px-4 py-2 border">Расход</th>
                    <th className="px-4 py-2 border">Комментарий</th>
                    <th className="px-4 py-2 border">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {report.expenses.map(e => (
                    <tr key={e.id} className="text-center border-t">
                      <td className="px-4 py-2 border">{e.name}</td>
                      <td className="px-4 py-2 border">{formatCurrency(e.amount)}</td>
                      <td className="px-4 py-2 border">{e.comment}</td>
                      <td className="px-4 py-2 border space-x-2">
                        <button className="text-blue-500" onClick={() => openExpense(e)}>Редактировать</button>
                        <button className="text-red-500" onClick={() => deleteExpense(e.id)}>Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {tab === 'receipts' && (
            <>
              <div className="flex justify-between items-center mt-4">
                <h2 className="text-xl">Поступления</h2>
                <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => openReceipt()}>Добавить</button>
              </div>
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Наименование поступления</th>
                    <th className="px-4 py-2 border">Сумма</th>
                    <th className="px-4 py-2 border">Комментарий</th>
                    <th className="px-4 py-2 border">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {report.receipts_list.map(rp => (
                    <tr key={rp.id} className="text-center border-t">
                      <td className="px-4 py-2 border">{rp.name}</td>
                      <td className="px-4 py-2 border">{formatCurrency(rp.amount)}</td>
                      <td className="px-4 py-2 border">{rp.comment}</td>
                      <td className="px-4 py-2 border space-x-2">
                        <button className="text-blue-500" onClick={() => openReceipt(rp)}>Редактировать</button>
                        <button className="text-red-500" onClick={() => deleteReceipt(rp.id)}>Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {tab === 'client_expenses' && (
            <>
              <div className="flex justify-between items-center mt-4">
                <h2 className="text-xl">Клиентские расходы</h2>
                <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => openClientExpense()}>Добавить</button>
              </div>
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Название</th>
                    <th className="px-4 py-2 border">Сумма</th>
                    <th className="px-4 py-2 border">Сумма с учетом НДС</th>
                    <th className="px-4 py-2 border">Комментарий</th>
                    <th className="px-4 py-2 border">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {report.client_expenses.map(c => (
                    <tr key={c.id} className="text-center border-t">
                      <td className="px-4 py-2 border">{c.name}</td>
                      <td className="px-4 py-2 border">{formatCurrency(c.amount)}</td>
                      <td className="px-4 py-2 border">{formatCurrency(Math.round(c.amount * 0.82))}</td>
                      <td className="px-4 py-2 border">{c.comment}</td>
                      <td className="px-4 py-2 border space-x-2">
                        <button className="text-blue-500" onClick={() => openClientExpense(c)}>Редактировать</button>
                        <button className="text-red-500" onClick={() => deleteClientExpense(c.id)}>Удалить</button>
                        <button className="ml-4 px-2 py-1 border rounded text-green-600" onClick={() => openCloseClientExpense(c)}>Закрыть расход</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {modal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white p-4 rounded w-96 space-y-4">
                {modal === 'expense' ? (
                  <>
                    <h2 className="text-lg font-semibold">{editingExpense ? 'Редактировать расход' : 'Новый расход'}</h2>
                    <label className="block">
                      <span className="text-sm text-gray-500">Наименование</span>
                      <input className="border p-2 w-full" value={expName} onChange={e => setExpName(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-500">Сумма</span>
                      <input className="border p-2 w-full" value={expAmount} onChange={e => setExpAmount(formatInput(e.target.value))} />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-500">Комментарий</span>
                      <input className="border p-2 w-full" value={expComment} onChange={e => setExpComment(e.target.value)} />
                    </label>
                    <div className="flex justify-end space-x-2">
                      <button className="px-3 py-1 border rounded" onClick={() => setModal('')}>Отмена</button>
                      <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={submitExpense}>Сохранить</button>
                    </div>
                  </>
                ) : modal === 'receipt' ? (
                  <>
                    <h2 className="text-lg font-semibold">{editingReceipt ? 'Редактировать поступление' : 'Новое поступление'}</h2>
                    <label className="block">
                      <span className="text-sm text-gray-500">Наименование</span>
                      <input className="border p-2 w-full" value={recName} onChange={e => setRecName(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-500">Сумма</span>
                      <input className="border p-2 w-full" value={recAmount} onChange={e => setRecAmount(formatInput(e.target.value))} />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-500">Комментарий</span>
                      <input className="border p-2 w-full" value={recComment} onChange={e => setRecComment(e.target.value)} />
                    </label>
                    <div className="flex justify-end space-x-2">
                      <button className="px-3 py-1 border rounded" onClick={() => setModal('')}>Отмена</button>
                      <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={submitReceipt}>Сохранить</button>
                    </div>
                  </>
                ) : modal === 'client_expense' ? (
                  <>
                    <h2 className="text-lg font-semibold">{editingClientExpense ? 'Редактировать клиентский расход' : 'Новый клиентский расход'}</h2>
                    <label className="block">
                      <span className="text-sm text-gray-500">Наименование</span>
                      <input className="border p-2 w-full" value={cExpName} onChange={e => setCExpName(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-500">Сумма</span>
                      <input className="border p-2 w-full" value={cExpAmount} onChange={e => setCExpAmount(formatInput(e.target.value))} />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-500">Сумма с учетом НДС</span>
                      <input className="border p-2 w-full bg-gray-50" value={formatInput(String(Math.round(parseNumber(cExpAmount) * 0.82)))} readOnly />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-500">Комментарий</span>
                      <input className="border p-2 w-full" value={cExpComment} onChange={e => setCExpComment(e.target.value)} />
                    </label>
                    <div className="flex justify-end space-x-2">
                      <button className="px-3 py-1 border rounded" onClick={() => setModal('')}>Отмена</button>
                      <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={submitClientExpense}>Сохранить</button>
                    </div>
                  </>
                ) : modal === 'close_client_expense' ? (
                  <>
                    <h2 className="text-lg font-semibold">Закрыть расход</h2>
                    <label className="block">
                      <span className="text-sm text-gray-500">Сумма</span>
                      <input className="border p-2 w-full" value={closeAmount} onChange={e => setCloseAmount(formatInput(e.target.value))} />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-500">Сумма с учетом НДС</span>
                      <input className="border p-2 w-full bg-gray-50" value={formatInput(String(Math.round(parseNumber(closeAmount) * 0.82)))} readOnly />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-500">Комментарий</span>
                      <input className="border p-2 w-full" value={closeComment} onChange={e => setCloseComment(e.target.value)} />
                    </label>
                    <div className="flex justify-end space-x-2">
                      <button className="px-3 py-1 border rounded" onClick={() => setModal('')}>Отмена</button>
                      <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={closeClientExpense}>Сохранить</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold">Сумма контракта</h2>
                    <input className="border p-2 w-full" value={fieldValue} onChange={e => setFieldValue(formatInput(e.target.value))} />
                    <div className="flex justify-end space-x-2">
                      <button className="px-3 py-1 border rounded" onClick={() => setModal('')}>Отмена</button>
                      <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={submitField}>Сохранить</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reports
