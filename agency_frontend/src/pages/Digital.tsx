import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import DigitalTasks from './DigitalTasks';
import DigitalFinance from './DigitalFinance';
import DigitalReports from './DigitalReports';
import DigitalSettings from './DigitalSettings';

function Digital() {
  return (
    <div className="p-4 space-y-4">
      <div className="space-x-4">
        <NavLink to="tasks" className={({isActive}) => isActive ? 'font-bold underline' : 'hover:underline'}>Задачи</NavLink>
        <NavLink to="finance" className={({isActive}) => isActive ? 'font-bold underline' : 'hover:underline'}>Финансы</NavLink>
        <NavLink to="reports" className={({isActive}) => isActive ? 'font-bold underline' : 'hover:underline'}>Отчеты</NavLink>
        <NavLink to="settings" className={({isActive}) => isActive ? 'font-bold underline' : 'hover:underline'}>Настройки</NavLink>
      </div>
      <Routes>
        <Route path="tasks" element={<DigitalTasks />} />
        <Route path="finance" element={<DigitalFinance />} />
        <Route path="reports" element={<DigitalReports />} />
        <Route path="settings" element={<DigitalSettings />} />
        <Route path="*" element={<Navigate to="tasks" replace />} />
      </Routes>
    </div>
  );
}

export default Digital;
