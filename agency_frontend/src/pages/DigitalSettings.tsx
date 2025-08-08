import { useEffect, useState } from 'react';
import { API_URL } from '../api';

interface Service { id: number; name: string }

export default function DigitalSettings() {
  const token = localStorage.getItem('token');
  const [services, setServices] = useState<Service[]>([]);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/digital/services`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  const add = async () => {
    if (!name) return;
    const res = await fetch(`${API_URL}/digital/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name })
    });
    if (res.ok) {
      const s = await res.json();
      setServices([...services, s]);
      setShow(false);
      setName('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-right">
        <button className="px-2 py-1 border rounded" onClick={() => setShow(true)}>Добавить услугу</button>
      </div>
      <ul className="list-disc pl-5 space-y-1">
        {services.map(s => <li key={s.id}>{s.name}</li>)}
      </ul>
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96 space-y-2">
            <h3 className="text-lg mb-2">Новая услуга</h3>
            <input className="border p-2 w-full" placeholder="Название" value={name} onChange={e => setName(e.target.value)} />
            <div className="text-right space-x-2">
              <button className="px-3 py-1 border rounded" onClick={() => setShow(false)}>Отмена</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={add}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
