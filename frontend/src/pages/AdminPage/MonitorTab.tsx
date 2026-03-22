import React, { useState } from 'react';

export const MonitorTab = ({ users, searchTerm, setSearchTerm, filterStatus, setFilterStatus }: any) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <div className="glass-card animate-fade-in">
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
                  <span className="full-name">{u.full_name}</span>
                </div>
              </td>
              <td>{u.position}</td>
              <td>{u.email}</td>
              <td><span className={`status-pill ${u.status}`}>{u.status}</span></td>
              <td className="actions-cell" style={{textAlign: 'center'}}>
                <button className="dots-btn" onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}>⋮</button>
                {openMenuId === u.id && (
                  <div className="action-menu">
                    <button>Редактировать</button>
                    <button>Сбросить пароль</button>
                    <button style={{color: '#ef4444'}}>Удалить</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};