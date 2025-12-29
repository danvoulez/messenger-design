'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuthToken, checkAuth } = useAuth();

  const handleRegister = async () => {
    if (!username || !displayName) {
      setError('Username and display name are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Begin registration
      const beginResponse = await fetch('/api/id/register/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          display_name: displayName,
          tenant_id: 'T.UBL',
        }),
      });

      if (!beginResponse.ok) {
        const data = await beginResponse.json();
        throw new Error(data.error || 'Registration failed');
      }

      const { challenge_id, options } = await beginResponse.json();

      // Step 2: Create credential with WebAuthn
      const attestation = await startRegistration(options);

      // Step 3: Finish registration
      const finishResponse = await fetch('/api/id/register/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id,
          attestation,
          tenant_id: 'T.UBL',
        }),
      });

      if (!finishResponse.ok) {
        const data = await finishResponse.json();
        throw new Error(data.error || 'Registration failed');
      }

      const { session_token } = await finishResponse.json();

      // Store token and redirect
      setAuthToken(session_token);
      await checkAuth();
      router.push('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Begin authentication
      const beginResponse = await fetch('/api/id/login/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          tenant_id: 'T.UBL',
        }),
      });

      if (!beginResponse.ok) {
        const data = await beginResponse.json();
        throw new Error(data.error || 'Login failed');
      }

      const { challenge_id, public_key } = await beginResponse.json();

      // Step 2: Get credential with WebAuthn
      const credential = await startAuthentication(public_key);

      // Step 3: Finish authentication
      const finishResponse = await fetch('/api/id/login/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id,
          credential,
          tenant_id: 'T.UBL',
        }),
      });

      if (!finishResponse.ok) {
        const data = await finishResponse.json();
        throw new Error(data.error || 'Login failed');
      }

      const { session_token } = await finishResponse.json();

      // Store token and redirect
      setAuthToken(session_token);
      await checkAuth();
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-base via-bg-elevated to-bg-base p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-light to-accent-default rounded-3xl shadow-glow mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            UBL Messenger
          </h1>
          <p className="text-text-secondary">
            Secure messaging with WebAuthn
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-elevated border border-border-default rounded-2xl shadow-xl p-8">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                mode === 'login'
                  ? 'bg-accent-default text-white shadow-md'
                  : 'bg-bg-hover text-text-secondary hover:bg-bg-base'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                mode === 'register'
                  ? 'bg-accent-default text-white shadow-md'
                  : 'bg-bg-hover text-text-secondary hover:bg-bg-base'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-bg-base border border-border-default rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-default focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full px-4 py-3 bg-bg-base border border-border-default rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-default focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            )}

            <button
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-accent-light to-accent-default text-white font-medium rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  <span>
                    {mode === 'login' ? 'Sign in with Passkey' : 'Create Passkey'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-border-subtle">
            <p className="text-xs text-text-tertiary text-center">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-accent-default hover:text-accent-light"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-accent-default hover:text-accent-light"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
            <p className="text-xs text-text-tertiary text-center mt-3">
              🔐 WebAuthn provides passwordless authentication using biometrics
              or security keys
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-text-tertiary">
          Tenant: <span className="text-text-secondary font-mono">T.UBL</span>
        </div>
      </div>
    </div>
  );
}
