import React, { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const MonitorTab = ({ users, searchTerm, setSearchTerm, filterStatus, setFilterStatus, fetchUsers }: any) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resettingUser, setResettingUser] = useState<any>(null);
  
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', middle_name: '', position: '', email: '' });
  const [newPassword, setNewPassword] = useState('');

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name,
      position: user.position,
      email: user.email
    });
    setOpenMenuId(null);
  };

  const submitEdit = async () => {
    try {
      await api.put(`/api/auth/admin/users/${editingUser.id}`, editForm);
      toast.success("Данные обновлены");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Ошибка обновления");
    }
  };

  const submitReset = async () => {
    try {
      await api.post(`/api/auth/admin/users/${resettingUser.id}/reset-password`, { password: newPassword });
      toast.success("Пароль сброшен");
      setResettingUser(null);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Ошибка сброса пароля");
    }
  };

  const handleDelete = async (user: any) => {
    setOpenMenuId(null);
    if (window.confirm(`Вы уверены, что хотите удалить сотрудника ${user.full_name}? Это действие необратимо.`)) {
      try {
        await api.delete(`/api/auth/admin/users/${user.id}`);
        toast.success("Сотрудник удален");
        fetchUsers();
      } catch (err: any) {
        toast.error(err.response?.data?.msg || "Ошибка удаления");
      }
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ position: 'relative' }}>
      <div className="table-controls">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Поиск по ФИО или Email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Все статусы</option>
          <option value="online">В сети</option>
          <option value="offline">Не в сети</option>
        </select>
      </div>
      <table className="users-table">
        <thead>
          <tr>
            <th>Сотрудник</th>
            <th>Должность</th>
            <th>Email</th>
            <th>Статус</th>
            <th style={{textAlign: 'center'}}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id}>
              <td>
                <div className="user-cell">
                  <div className="small-avatar">{u.last_name[0]}</div>
                  <span className="full-name">{u.full_name} {u.role === 'Admin' && '👑'}</span>
                </div>
              </td>
              <td>{u.position}</td>
              <td>{u.email}</td>
              <td><span className={`status-pill ${u.status}`}>{u.status === 'online' ? 'В сети' : 'Оффлайн'}</span></td>
              <td className="actions-cell" style={{textAlign: 'center'}}>
                {u.role !== 'Admin' && (
                  <button className="dots-btn" onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}>⋮</button>
                )}
                {openMenuId === u.id && (
                  <div className="action-menu">
                    <button onClick={() => handleEditClick(u)}>Редактировать</button>
                    <button onClick={() => { setResettingUser(u); setOpenMenuId(null); }}>Сбросить пароль</button>
                    <button style={{color: '#ef4444'}} onClick={() => handleDelete(u)}>Удалить</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h3 style={{marginBottom: '15px'}}>Редактирование: {editingUser.full_name}</h3>
            <div className="admin-modal-form">
              <input placeholder="Фамилия" value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} />
              <input placeholder="Имя" value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} />
              <input placeholder="Отчество" value={editForm.middle_name} onChange={e => setEditForm({...editForm, middle_name: e.target.value})} />
              <input placeholder="Email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
              <input placeholder="Должность" value={editForm.position} onChange={e => setEditForm({...editForm, position: e.target.value})} />
            </div>
            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={() => setEditingUser(null)}>Отмена</button>
              <button className="btn-submit" style={{padding: '8px 16px'}} onClick={submitEdit}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {resettingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h3 style={{marginBottom: '15px'}}>Новый пароль для {resettingUser.first_name}</h3>
            <div className="admin-modal-form">
              <input 
                type="password" 
                placeholder="Мин. 8 символов, буквы (a-Z), цифры, спец. символы" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
              />
            </div>
            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={() => { setResettingUser(null); setNewPassword(''); }}>Отмена</button>
              <button className="btn-submit" style={{padding: '8px 16px'}} onClick={submitReset}>Сбросить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};