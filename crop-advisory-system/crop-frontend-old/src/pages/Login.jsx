import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const { login, user, sendOTP, loginWithOTP, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ email: 'farmer@demo.com', password: 'password' })
  const [role, setRole] = useState('farmer') 
  
  // Load Google Identity Services dynamically
  useEffect(() => {
    if (role !== 'farmer') return;
    
    window.handleGoogleCredentialResponse = async (response) => {
      setLoading(true);
      setError('');
      setInfoMsg('Signing in with Google...');
      try {
        const loggedUser = await loginWithGoogle(response.credential);
        setInfoMsg('Successfully signed in with Google!');
        navigate(`/${loggedUser.role}`);
      } catch (err) {
        setError(err.response?.data?.message || 'Google Sign-In failed.');
      } finally {
        setLoading(false);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '727775400619-aavsvhsgpthv9m0c1m7jit44k8eo5k4k.apps.googleusercontent.com',
          callback: window.handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInBtn'),
          { theme: 'outline', size: 'large', width: 360 }
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [role]);
  const [error, setError] = useState('')
  const [infoMsg, setInfoMsg] = useState('')
  const [loading, setLoading] = useState(false)
  
  // OTP state
  const [loginMode, setLoginMode] = useState('password') // 'password' or 'otp'
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSendOTP = async () => {
    if (!phoneOrEmail) {
      setError('Please enter your registered mobile number');
      return;
    }
    setError('');
    setInfoMsg('Sending verification code to your mobile...');
    setOtpSent(true);
    setCountdown(60);
    setLoading(true);
    try {
      await sendOTP(phoneOrEmail);
      setInfoMsg('Verification OTP code sent to your registered mobile number.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Make sure the mobile number is registered.');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfoMsg('')
    
    if (loginMode === 'otp' && !otpSent) {
      await handleSendOTP();
      return;
    }

    setLoading(true)
    try {
      let loggedUser;
      if (loginMode === 'otp') {
        if (!otp) {
          setError('Please enter the 6-digit OTP');
          setLoading(false);
          return;
        }
        loggedUser = await loginWithOTP(phoneOrEmail, otp);
      } else {
        loggedUser = await login(form.email, form.password);
      }
      navigate(`/${loggedUser.role}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const setDemoRole = (selectedRole) => {
    setRole(selectedRole)
    setError('')
    setInfoMsg('')
    setOtpSent(false)
    setLoginMode('password')
    const demoEmails = { farmer: 'farmer@demo.com', officer: 'officer@demo.com', admin: 'admin@demo.com' }
    setForm({ email: demoEmails[selectedRole], password: 'password' })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-cream)' }}>
      {/* Header Banner */}
      <div className="premium-header" style={{ padding: '4rem 1.5rem 3.5rem', background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', color: '#fff', position: 'relative' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🌿</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1.5px', margin: 0 }}>CropAdvisor</h1>
          <p style={{ opacity: 0.85, fontSize: '1rem', marginTop: '0.5rem', fontWeight: 500 }}>Smart farming for every field</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '2rem', justifyContent: 'center' }}>
          {['Disease AI', 'Market AI', 'Smart Advice', 'Real-Time Alerts'].map(tag => (
            <span key={tag} style={{ 
              background: 'rgba(255,255,255,0.12)', 
              padding: '0.4rem 0.9rem', 
              borderRadius: '2rem', 
              fontSize: '0.7rem',
              fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div style={{ 
        padding: '2.5rem 2rem', 
        flex: 1, 
        background: '#fff', 
        marginTop: '-2rem', 
        borderRadius: '2.5rem 2.5rem 0 0', 
        boxShadow: '0 -15px 40px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '480px',
        width: '100%',
        margin: '-2rem auto 0',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-dark)' }}>Sign In</h2>

        {/* Role tabs */}
        <div className="role-tabs" style={{ display: 'flex', background: '#f0f3f1', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem' }}>
          {['farmer', 'officer', 'admin'].map(r => (
            <button 
              key={r}
              type="button"
              style={{
                flex: 1,
                padding: '0.8rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: role === r ? '#fff' : 'transparent',
                color: role === r ? '#2d6a4f' : '#6b7280',
                boxShadow: role === r ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => setDemoRole(r)}
            >
              {r === 'farmer' ? 'Farmer' : r === 'officer' ? 'Officer' : 'Admin'}
            </button>
          ))}
        </div>

        {/* Dynamic Mode Selector (ONLY for farmers) */}
        {role === 'farmer' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => { setLoginMode('password'); setError(''); setInfoMsg(''); }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid ' + (loginMode === 'password' ? 'var(--primary)' : '#e5e7eb'),
                background: loginMode === 'password' ? 'rgba(45, 106, 79, 0.08)' : 'transparent',
                color: loginMode === 'password' ? 'var(--primary)' : '#6b7280',
                cursor: 'pointer'
              }}
            >
              🔑 Password Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('otp'); setError(''); setInfoMsg(''); }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid ' + (loginMode === 'otp' ? 'var(--primary)' : '#e5e7eb'),
                background: loginMode === 'otp' ? 'rgba(45, 106, 79, 0.08)' : 'transparent',
                color: loginMode === 'otp' ? 'var(--primary)' : '#6b7280',
                cursor: 'pointer'
              }}
            >
              📲 Mobile OTP Login
            </button>
          </div>
        )}

        {/* Alert & Message Display */}
        {error && (
          <div className="alert-banner" style={{ background: '#FFF3F0', color: '#dc2626', border: '1px solid #fee2e2', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', background: '#dc2626', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="alert-banner" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', background: '#059669', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{infoMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {loginMode === 'password' ? (
            <>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>EMAIL ADDRESS</label>
                <input
                  name="email" 
                  type="email"
                  className="input-field"
                  placeholder="name@email.com"
                  value={form.email}
                  onChange={handle}
                  required
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>PASSWORD</label>
                <input
                  name="password" 
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handle}
                  required
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>REGISTERED MOBILE NUMBER</label>
                  {otpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setError('');
                        setInfoMsg('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2d6a4f',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      ✏️ Change Number
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 9876543210"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={otpSent}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    background: otpSent ? '#f9fafb' : '#fff'
                  }}
                />
              </div>

              {otpSent && (
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>ENTER 6-DIGIT OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #e5e7eb',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      letterSpacing: '8px',
                      textAlign: 'center',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.8rem' }}>
                    <span style={{ color: '#6b7280' }}>Didn't receive code?</span>
                    <button
                      type="button"
                      disabled={countdown > 0 || loading}
                      onClick={handleSendOTP}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: countdown > 0 ? '#9ca3af' : '#2d6a4f',
                        fontWeight: 700,
                        cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                        padding: 0,
                        marginLeft: 'auto'
                      }}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading} 
            style={{ 
              marginTop: '1rem', 
              padding: '1.1rem',
              borderRadius: '12px',
              border: 'none',
              background: '#2d6a4f',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(45, 106, 79, 0.25)',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {loading ? 'Processing...' : (loginMode === 'otp' ? (otpSent ? 'Confirm & Sign In →' : 'Send OTP Code') : 'Sign In Now →')}
          </button>
        </form>

        {role === 'farmer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px' }}>OR SIGN IN WITH</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            </div>
            <div id="googleSignInBtn" style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }}></div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
          Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#2d6a4f', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>Register</span>
        </p>
      </div>
    </div>
  )
}

export default Login
