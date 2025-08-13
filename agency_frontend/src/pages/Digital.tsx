import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import DigitalTasks from './DigitalTasks';
import DigitalFinance from './DigitalFinance';
import DigitalReports from './DigitalReports';
import DigitalSettings from './DigitalSettings';

function Digital() {
  return (
    <div className="p-4 space-y-4">
      <div className="space-x-2 mb-4">
        <NavLink
          to="tasks"
          className={({ isActive }) =>
            `px-2 py-1 border rounded ${isActive ? 'bg-blue-500 text-white' : ''}`
          }
        >
          Задачи
        </NavLink>
        <NavLink
          to="finance"
          className={({ isActive }) =>
            `px-2 py-1 border rounded ${isActive ? 'bg-blue-500 text-white' : ''}`
          }
        >
          Финансы
        </NavLink>
        <NavLink
          to="reports"
          className={({ isActive }) =>
            `px-2 py-1 border rounded ${isActive ? 'bg-blue-500 text-white' : ''}`
          }
        >
          Отчеты
        </NavLink>
        <NavLink
          to="settings"
          className={({ isActive }) =>
            `px-2 py-1 border rounded ${isActive ? 'bg-blue-500 text-white' : ''}`
          }
        >
          Настройки
        </NavLink>
      </div>
      <Routes>
        <Route path="tasks/*" element={<DigitalTasks />} />
        <Route path="finance" element={<DigitalFinance />} />
        <Route path="reports" element={<DigitalReports />} />
        <Route path="settings" element={<DigitalSettings />} />
        <Route path="*" element={<Navigate to="tasks" replace />} />
      </Routes>
    </div>
  );
}

export default Digital;
