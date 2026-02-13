/**
 * Register Page
 */
import { useState } from 'react';
import { useAuthStore } from '@/hooks';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setValidationError('');

    if (!fullName.trim()) {
      setValidationError('Full name is required');
      return;
    }

    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(email, password, fullName);
    } catch (err: any) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0e27',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      padding: 0
    }}>
      <div style={{
        backgroundColor: '#1a1f3a',
        color: '#00d9ff',
        padding: '2rem',
        borderRadius: '8px',
        border: '2px solid #00d9ff',
        textAlign: 'center',
        minWidth: '350px'
      }}>
        <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>SYNAPSE</h1>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#a000ff', fontSize: '1.1rem' }}>Create Account</h2>
        
        {(validationError || error) && (
          <div style={{ 
            color: '#ff006e', 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            backgroundColor: 'rgba(255,0,110,0.1)', 
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {validationError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ color: '#00d9ff', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#0a0e27',
                color: '#00d9ff',
                border: '1px solid #00d9ff',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif'
              }}
              placeholder="John Doe"
            />
          </div>

          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ color: '#00d9ff', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#0a0e27',
                color: '#00d9ff',
                border: '1px solid #00d9ff',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif'
              }}
              placeholder="your@email.com"
            />
          </div>

          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ color: '#00d9ff', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#0a0e27',
                color: '#00d9ff',
                border: '1px solid #00d9ff',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif'
              }}
              placeholder="••••••••"
            />
          </div>

          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ color: '#00d9ff', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#0a0e27',
                color: '#00d9ff',
                border: '1px solid #00d9ff',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: isLoading ? '#666' : '#00d9ff',
              color: '#0a0e27',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <p>Already have an account? <a href="/login" style={{ color: '#00d9ff', textDecoration: 'none', fontWeight: 'bold' }}>Login</a></p>
        </div>
      </div>
    </div>
  );
};
