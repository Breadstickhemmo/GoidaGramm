export const Sidebar = ({ activeTab, setActiveTab, user, logout }: any) => (
  <aside className="admin-sidebar">
    <div className="sidebar-brand">
      <div className="brand-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </div>
<span className="admin-logo-text">Goidagram</span>
    </div>
    <nav className="sidebar-nav">
      <div className="nav-group-label">Система</div>
      <button className={`nav-link ${activeTab === 'monitor' ? 'active' : ''}`} onClick={() => setActiveTab('monitor')}>
        <span>📊</span> Мониторинг штата
      </button>
      <button className={`nav-link ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
        <span>👤</span> Добавить сотрудника
      </button>
    </nav>
    <div className="sidebar-footer">
      <div className="admin-profile-card">
        <div className="admin-avatar">{user?.first_name?.[0] || 'A'}</div>
        <div className="admin-meta">
          <span className="admin-name">{user?.last_name} {user?.first_name}</span>
          <span className="admin-role">Администратор</span>
        </div>
        <button className="icon-logout" onClick={logout}>🚪</button>
      </div>
    </div>
  </aside>
);