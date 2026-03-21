import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../styles/auth.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeModal, setActiveModal] = useState<'forgot' | 'support' | null>(null);
  const [copied, setCopied] = useState(false);
  
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
  setError('');
  setIsLoading(true);
  
  try {
    const res = await api.post('/api/auth/login', { email, password });
    
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    login(res.data.user, res.data.access_token);
    navigate(res.data.user.role === 'Admin' ? '/admin' : '/');
    
  } catch (err: any) {
    setError('Неверный email или пароль. Пожалуйста, попробуйте снова.');
  } finally {
    setIsLoading(false);
  }
 };

  const emailTemplate = `Тема: Сброс пароля от Goidagram

Здравствуйте, служба поддержки!
Прошу сбросить пароль для моей учетной записи в корпоративном мессенджере.

Мои данные:
ФИО: [Впишите ваши ФИО]
Должность/Отдел: [Впишите ваш отдел]
Корпоративный email: [Впишите ваш email]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="login-split-container">
      {/* Левая часть - Форма */}
      <div className="auth-section">
        <div className="auth-header-top animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="logo-wrapper">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <span className="logo-text">Goidagram</span>
          </div>
        </div>

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
                  id="email"
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required 
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
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
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
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={() => setRememberMe(!rememberMe)} 
                />
                <span className="checkmark">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                Запомнить меня
              </label>
              {/* Заменили ссылку на кнопку для открытия модалки */}
              <button type="button" className="text-action-btn" onClick={() => setActiveModal('forgot')}>Забыли пароль?</button>
            </div>

            {error && <div className="error-toast">{error}</div>}

            <button type="submit" className={`login-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? 'Авторизация...' : 'Войти в систему'} 
              {!isLoading && <svg className="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
            </button>
          </form>

          <div className="auth-footer animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {/* Заменили ссылку на кнопку для открытия модалки */}
            <p>Нужна помощь? <button type="button" className="text-action-btn" onClick={() => setActiveModal('support')}>Написать IT-отделу</button></p>
          </div>
        </div>

        <div className="copyright-info">
          © {new Date().getFullYear()} Goidagram. Все права защищены.
        </div>
      </div>

      {/* Правая часть - Брендинг */}
      <div className="brand-section">
        <div className="brand-glow-1"></div>
        <div className="brand-glow-2"></div>
        <div className="brand-bg-pattern"></div>
        
        <div className="overlay-content animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="brand-text-content">
            <h2>Общайтесь без границ внутри компании</h2>
            <p>Защищенный корпоративный мессенджер с микросервисной архитектурой для мгновенного обмена сообщениями и файлами</p>
          </div>
          
          <div className="feature-cards">
            <div className="f-card">
              <div className="f-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div className="f-text">
                <h4>Абсолютная безопасность</h4>
                <p>E2E шифрование данных и работа в закрытом периметре.</p>
              </div>
            </div>
            
            <div className="f-card">
              <div className="f-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <div className="f-text">
                <h4>Высокая скорость</h4>
                <p>Мгновенная доставка сообщений через WebSockets.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- МОДАЛЬНЫЕ ОКНА --- */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-container animate-scale-in" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {activeModal === 'forgot' && (
              <>
                <h3 className="modal-title">Восстановление доступа</h3>
                <p className="modal-desc">
                  В целях безопасности самостоятельный сброс пароля отключен. 
                  Пожалуйста, отправьте запрос администратору системы на почту <strong>admin@goida.ru</strong>.
                </p>
                <div className="modal-template-box">
                  <div className="template-header">
                    <span>Шаблон письма</span>
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                      {copied ? 'Скопировано!' : 'Копировать'}
                    </button>
                  </div>
                  <pre className="template-content">{emailTemplate}</pre>
                </div>
              </>
            )}

            {activeModal === 'support' && (
              <>
                <h3 className="modal-title">Служба поддержки IT</h3>
                <p className="modal-desc">
                  Если у вас возникли проблемы с доступом к сети Goidagram, ознакомьтесь с частыми вопросами или напишите нам.
                </p>
                
                <div className="faq-list">
                  <div className="faq-item">
                    <h5>Как получить учетную запись?</h5>
                    <p>Доступ выдается автоматически в ваш первый рабочий день. Логин и временный пароль придут на вашу личную почту, указанную при трудоустройстве.</p>
                  </div>
                  <div className="faq-item">
                    <h5>Нужен ли VPN для доступа из дома?</h5>
                    <p>Да, для подключения вне офиса необходимо активировать корпоративный VPN-клиент.</p>
                  </div>
                </div>

                <div className="support-contact-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <div>
                    <span>Прямая связь с IT-отделом:</span>
                    <a href="mailto:admin@goida.ru">admin@goida.ru</a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};