import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { BrandSection } from './BrandSection';
import { AuthModals } from './AuthModals';
import '../../styles/LoginPageStyles/login-page.css';

export const LoginPage = () => {
  const [activeModal, setActiveModal] = useState<'forgot' | 'support' | null>(null);

  return (
    <div className="login-split-container">
      <div className="auth-section">
        <div className="auth-header-top animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="logo-wrapper">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <span className="logo-text">Goidagram</span>
          </div>
        </div>

        <LoginForm onOpenModal={setActiveModal} />

        <div className="copyright-info">
          © {new Date().getFullYear()} Goidagram. Все права защищены.
        </div>
      </div>

      <BrandSection />

      <AuthModals 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
      />
    </div>
  );
};