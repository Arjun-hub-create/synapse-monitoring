import { useState } from 'react';
import { useAuthStore } from '@/hooks';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#0a0e27',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: '#1a1f3a',
        border: '1px solid #00d9ff',
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#00d9ff',
          marginBottom: '0.5rem',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          SYNAPSE
        </h1>
        
        <h2 style={{
          fontSize: '1.2rem',
          color: '#a000ff',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          System Monitoring Platform
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#ff006e',
            color: 'white',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#e0e0ff',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#0a0e27',
                border: '1px solid #2a2f4a',
                borderRadius: '4px',
                color: '#e0e0ff',
                fontSize: '1rem',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#e0e0ff',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#0a0e27',
                border: '1px solid #2a2f4a',
                borderRadius: '4px',
                color: '#e0e0ff',
                fontSize: '1rem',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px',
              marginTop: '1rem',
              backgroundColor: '#00d9ff',
              color: '#0a0e27',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '0.85rem'
        }}>
          <p>Demo: test@example.com / password123</p>
          <p style={{ marginTop: '0.5rem' }}>
            Don't have account? <a href="/register" style={{ color: '#00d9ff', textDecoration: 'none' }}>Sign up</a>
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <a href="/forgot-password" style={{ color: '#00d9ff', textDecoration: 'none' }}>Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
