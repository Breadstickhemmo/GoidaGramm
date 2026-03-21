import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

export const AdminPage = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/admin/create-user', {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName
      });
      setStatus({ type: 'success', msg: `Сотрудник ${formData.email} успешно создан!` });
      setFormData({ fullName: '', email: '', password: '' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.response?.data?.msg || 'Ошибка сервера' });
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="logo-section">
          <h2>Goidagram</h2>
        </div>
        <nav className="nav-menu">
          <div className="nav-item active">Управление пользователями</div>
          <div className="nav-item disabled">Логи системы (скоро)</div>
        </nav>
        <div className="user-profile">
          <div className="avatar-circle">{user?.full_name[0]}</div>
          <div className="profile-info">
            <p className="name">{user?.full_name}</p>
            <p className="role">{user?.role}</p>
          </div>
          <button className="logout-btn-icon" onClick={logout} title="Выйти">🚪</button>
        </div>
      </aside>

      <main className="content">
        <header className="page-header">
          <h1>Панель администратора</h1>
        </header>

        <section className="admin-card">
          <h3>Регистрация нового сотрудника</h3>
          <p className="description">Создайте учетную запись для нового члена команды.</p>
          
          <form className="admin-form" onSubmit={handleCreateUser}>
            <div className="input-group">
              <label>ФИО Сотрудника</label>
              <input 
                type="text" 
                placeholder="Иванов Иван Иванович" 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Корпоративная почта</label>
              <input 
                type="email" 
                placeholder="ivanov@goida.ru" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Временный пароль</label>
              <input 
                type="password" 
                placeholder="Минимум 8 символов" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
            <button type="submit" className="primary-btn">Создать аккаунт</button>
          </form>

          {status.msg && (
            <div className={`status-box ${status.type}`}>
              {status.msg}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};