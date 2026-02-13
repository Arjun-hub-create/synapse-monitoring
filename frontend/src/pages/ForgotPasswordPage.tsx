/**
 * Forgot Password Page
 */
import { useState } from 'react';
import { getApiClient } from '@/utils/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await getApiClient().post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
          <h1 style={{ marginTop: 0, marginBottom: '1rem', color: '#00ff00' }}>Success!</h1>
          <p style={{ marginBottom: '1rem' }}>Check your email for password reset instructions.</p>
          <a href="/login" style={{
            backgroundColor: '#00d9ff',
            color: '#0a0e27',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>Back to Login</a>
        </div>
      </div>
    );
  }

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
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#a000ff', fontSize: '1.1rem' }}>Reset Password</h2>
        
        {error && (
          <div style={{ 
            color: '#ff006e', 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            backgroundColor: 'rgba(255,0,110,0.1)', 
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
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
              required
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
            {isLoading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <p><a href="/login" style={{ color: '#00d9ff', textDecoration: 'none', fontWeight: 'bold' }}>Back to Login</a></p>
        </div>
      </div>
    </div>
  );
};
