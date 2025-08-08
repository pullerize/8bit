import { useState } from 'react';
import { useLocation } from 'react-router-dom';

interface LinkItem { id: number; name: string; url: string }
interface TaskItem { id: number; title: string; description: string; links: LinkItem[] }

export default function DigitalProject() {
  const { state } = useLocation();
  const project = state as { id: number; project: string } | undefined;
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linksModal, setLinksModal] = useState<LinkItem[] | null>(null);

  const addTask = () => {
    if (!title) return;
    const item: TaskItem = { id: Date.now(), title, description: desc, links };
    setTasks([...tasks, item]);
    setShow(false);
    setTitle('');
    setDesc('');
    setLinks([]);
  };

  const addLink = () => setLinks([...links, { id: Date.now(), name: '', url: '' }]);

  const updateLink = (id: number, field: 'name' | 'url', value: string) => {
    setLinks(links.map(l => (l.id === id ? { ...l, [field]: value } : l)));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-center text-xl">{project?.project}</h2>
      <div className="text-right">
        <button className="px-2 py-1 border rounded" onClick={() => setShow(true)}>Добавить задачу</button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">Название задачи</th>
            <th className="px-2 py-1 border">Описание</th>
            <th className="px-2 py-1 border">Полезные ссылки</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} className="text-center">
              <td className="border px-2 py-1">{t.title}</td>
              <td className="border px-2 py-1">{t.description}</td>
              <td className="border px-2 py-1">
                {t.links.length > 0 && (
                  <button className="text-blue-500 underline" onClick={() => setLinksModal(t.links)}>Полезные ссылки</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96 space-y-2">
            <h3 className="text-lg mb-2">Новая задача</h3>
            <input className="border p-2 w-full" placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="border p-2 w-full" placeholder="Описание" value={desc} onChange={e => setDesc(e.target.value)} />
            <div className="space-y-1">
              {links.map(l => (
                <div key={l.id} className="flex gap-1">
                  <input className="border p-1 flex-1" placeholder="Название" value={l.name} onChange={e => updateLink(l.id, 'name', e.target.value)} />
                  <input className="border p-1 flex-1" placeholder="Ссылка" value={l.url} onChange={e => updateLink(l.id, 'url', e.target.value)} />
                </div>
              ))}
            </div>
            <button className="text-sm text-blue-500" onClick={addLink}>Добавить ссылку</button>
            <div className="text-right space-x-2">
              <button className="px-3 py-1 border rounded" onClick={() => setShow(false)}>Отмена</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={addTask}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
      {linksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96 space-y-2">
            <h3 className="text-lg mb-2">Полезные ссылки</h3>
            <ul className="list-disc pl-4 space-y-1">
              {linksModal.map(l => (
                <li key={l.id}>
                  <a className="text-blue-500 underline" href={l.url} target="_blank" rel="noreferrer">{l.name || l.url}</a>
                </li>
              ))}
            </ul>
            <div className="text-right">
              <button className="px-3 py-1 border rounded" onClick={() => setLinksModal(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

