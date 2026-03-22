import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import '../../styles/LoginPageStyles/login-form.css';

interface LoginFormProps {
  onOpenModal: (modal: 'forgot' | 'support') => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onOpenModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await api.post('/api/auth/login', { email, password });
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      toast.success(`С возвращением, ${res.data.user.full_name}!`, {
        icon: '👋',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });

      login(res.data.user, res.data.access_token);
      navigate(res.data.user.role === 'Admin' ? '/admin' : '/');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Неверные данные для входа', {
        duration: 4000,
        position: 'bottom-center'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <div className="welcome-texts animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h1>С возвращением</h1>
        <p>Введите корпоративные данные для доступа к безопасному рабочему пространству.</p>
      </div>

      <form onSubmit={handleSubmit} className="modern-form animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="input-field">
          <label htmlFor="email">Корпоративный email</label>
          <div className="input-wrapper">
            <span className="field-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </span>
            <input 
              id="email" type="email" placeholder="name@company.com" 
              value={email} onChange={e => setEmail(e.target.value)} required 
            />
          </div>
        </div>

        <div className="input-field">
          <label htmlFor="password">Пароль</label>
          <div className="input-wrapper">
            <span className="field-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <input 
              id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" 
              value={password} onChange={e => setPassword(e.target.value)} required 
            />
            <button 
              type="button" className="eye-btn" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>

        <div className="form-options">
          <label className="checkbox-container">
            <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
            <span className="checkmark"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
            Запомнить меня
          </label>
          <button type="button" className="text-action-btn" onClick={() => onOpenModal('forgot')}>Забыли пароль?</button>
        </div>

        {error && <div className="error-toast">{error}</div>}

        <button type="submit" className={`login-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
          {isLoading ? 'Авторизация...' : 'Войти в систему'} 
          {!isLoading && <svg className="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
        </button>
      </form>

      <div className="auth-footer animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <p>Нужна помощь? <button type="button" className="text-action-btn" onClick={() => onOpenModal('support')}>Написать IT-отделу</button></p>
      </div>
    </div>
  );
};