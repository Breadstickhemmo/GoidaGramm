import React from 'react';
import '../../styles/LoginPageStyles/brand-section.css';

export const BrandSection: React.FC = () => {
  return (
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
  );
};