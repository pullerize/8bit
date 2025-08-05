import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Reports from './pages/Reports'
import ExpensesReport from './pages/ExpensesReport'
import EmployeeReport from './pages/EmployeeReport'
import Users from './pages/Users'
import Operators from './pages/Operators'
import Projects from './pages/ProjectsOverview'
import ProjectsAdmin from './pages/ProjectsAdmin'
import ProjectsOverview from './pages/ProjectsOverview'
import ProjectDetail from './pages/ProjectDetail'
import AdminPanel from './pages/AdminPanel'

function App() {
  const token = localStorage.getItem('token')
  return (
    <>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/tasks"
          element={token ? <Tasks /> : <Navigate to="/login" />} />
        <Route
          path="/calendar"
          element={token ? <Calendar /> : <Navigate to="/login" />} />
        <Route
          path="/reports"
          element={token ? <Reports /> : <Navigate to="/login" />} />
        <Route
          path="/employee-report"
          element={token ? <EmployeeReport /> : <Navigate to="/login" />} />
        <Route
          path="/expenses-report"
          element={token ? <ExpensesReport /> : <Navigate to="/login" />} />
        <Route
          path="/admin"
          element={token ? <AdminPanel /> : <Navigate to="/login" />} />
        <Route path="/users" element={token ? <Users /> : <Navigate to="/login" />} />
        <Route path="/operators" element={token ? <Operators /> : <Navigate to="/login" />} />
        <Route path="/projects" element={token ? <ProjectsOverview /> : <Navigate to="/login" />} />
        <Route path="/projects/:id" element={token ? <ProjectDetail /> : <Navigate to="/login" />} />
        <Route path="/projects-admin" element={token ? <ProjectsAdmin /> : <Navigate to="/login" />} />
        <Route
          path="*"
          element={<Navigate to={token ? '/tasks' : '/login'} />} />
      </Routes>
    </>
  )
}

export default App
