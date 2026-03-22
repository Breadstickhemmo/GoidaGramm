import React, { useState } from 'react';
import '../../styles/LoginPageStyles/auth-modals.css';

interface AuthModalsProps {
  activeModal: 'forgot' | 'support' | null;
  onClose: () => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({ activeModal, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!activeModal) return null;

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container animate-scale-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
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
                <p>Доступ выдается автоматически в ваш первый рабочий день. Логин и пароль придут на вашу личную почту, указанную при трудоустройстве.</p>
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
  );
};