export const CreateTab = ({ formData, setFormData, handleCreate, isLoading }: any) => {
  const fields = [
    { id: 'lastName', label: 'Фамилия', placeholder: 'Иванов' },
    { id: 'firstName', label: 'Имя', placeholder: 'Иван' },
    { id: 'middleName', label: 'Отчество', placeholder: 'Иванович' },
    { id: 'position', label: 'Должность', placeholder: 'Ведущий разработчик' },
    { id: 'email', label: 'Корпоративный Email', placeholder: 'ivanov@company.ru' },
    { id: 'password', label: 'Пароль для входа', placeholder: 'Минимум 8 символов' }
  ];

  return (
    <section className="glass-card creation-section animate-fade-in">
      <div className="form-info-header">
      </div>
      <form onSubmit={handleCreate} className="complex-form">
        <div className="form-grid">
          {fields.map((f) => (
            <div className="input-box" key={f.id}>
              <label>{f.label}</label>
              <input 
                type={f.id === 'password' ? 'password' : 'text'}
                placeholder={f.placeholder}
                value={formData[f.id as keyof typeof formData]}
                onChange={e => setFormData({...formData, [f.id]: e.target.value})}
                required={f.id !== 'middleName'}
              />
            </div>
          ))}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрировать сотрудника'}
          </button>
        </div>
      </form>
    </section>
  );
};