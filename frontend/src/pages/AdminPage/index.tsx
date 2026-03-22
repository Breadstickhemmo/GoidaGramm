import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Sidebar } from './Sidebar';
import { MonitorTab } from './MonitorTab';
import { CreateTab } from './CreateTab';

import '../../styles/AdminPageStyles/layout.css';
import '../../styles/AdminPageStyles/monitor.css';
import '../../styles/AdminPageStyles/create.css';

export const AdminPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'monitor' | 'create'>('monitor');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', middleName: '', email: '', position: '', password: '' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/auth/admin/users');
      setUsers(res.data);
    } catch { toast.error("Ошибка загрузки"); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameRegex = /^[A-Za-zА-Яа-яЁё\- ]+$/;
    if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
      return toast.error("В именах нельзя использовать цифры");
    }
    if (formData.password.length < 8) return toast.error("Пароль от 8 символов");

    setIsLoading(true);
    try {
      await api.post('/api/auth/admin/create-user', {
        email: formData.email, password: formData.password,
        first_name: formData.firstName, last_name: formData.lastName,
        middle_name: formData.middleName, position: formData.position
      });
      toast.success("Готово");
      setFormData({ firstName: '', lastName: '', middleName: '', email: '', position: '', password: '' });
      fetchUsers();
      setActiveTab('monitor');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Ошибка");
    } finally { setIsLoading(false); }
  };

  const filtered = users.filter((u: any) => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (filterStatus === 'all' || u.status === filterStatus)
  );

  return (
    <div className="admin-dashboard">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} logout={logout} />
      <main className="admin-content">
        <header className="content-header">
          <h1>{activeTab === 'monitor' ? 'Мониторинг штата' : 'Регистрация сотрудника'}</h1>
          {activeTab === 'monitor' && <button className="btn-submit" style={{padding: '10px 20px'}} onClick={() => setActiveTab('create')}>+ Добавить</button>}
        </header>
        {activeTab === 'monitor' ? 
          <MonitorTab users={filtered} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterStatus={filterStatus} setFilterStatus={setFilterStatus} /> : 
          <CreateTab formData={formData} setFormData={setFormData} handleCreate={handleCreate} isLoading={isLoading} />
        }
      </main>
    </div>
  );
};