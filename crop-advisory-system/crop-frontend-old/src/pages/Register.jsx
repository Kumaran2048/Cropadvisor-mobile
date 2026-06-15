import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SUPPORTED_REGIONS } from '../utils/constants'
import { 
  Sprout, 
  MapPin, 
  User, 
  Mail, 
  Lock, 
  Phone,
  ArrowRight,
  ChevronLeft
} from 'lucide-react'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'farmer', district: '', state: ''
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const states = Object.keys(SUPPORTED_REGIONS)
  const districts = form.state ? SUPPORTED_REGIONS[form.state] : []

  const handle = (e) => {
    const { name, value } = e.target
    if (name === 'state') {
      setForm({ ...form, state: value, district: '' })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.state || !form.district) {
      setError('Please select a supported state and district.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const user = await register(form)
      navigate(`/${user.role}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans text-gray-900">
      {/* Header Section */}
      <div className="bg-farmer p-8 pb-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-1 text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-bold">Back to Login</span>
        </button>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/30">
            <Sprout size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Create Account</h1>
          <p className="text-white/70 text-sm max-w-xs mx-auto">Join the smart farming revolution today.</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-white -mt-10 rounded-t-[40px] shadow-2xl px-6 py-10 relative z-20">
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-red-600 text-xs font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handle}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-farmer" 
                  placeholder="Your Name"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  name="phone" 
                  value={form.phone} 
                  onChange={handle}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-farmer" 
                  placeholder="10 Digits"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                name="email" 
                type="email"
                value={form.email} 
                onChange={handle}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-farmer" 
                placeholder="farmer@example.com"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                name="password" 
                type="password"
                value={form.password} 
                onChange={handle}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-farmer" 
                placeholder="Min 6 characters"
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select State</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  name="state" 
                  value={form.state} 
                  onChange={handle}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-farmer appearance-none"
                  required
                >
                  <option value="">Choose...</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  name="district" 
                  value={form.district} 
                  onChange={handle}
                  disabled={!form.state}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-farmer appearance-none disabled:opacity-50"
                  required
                >
                  <option value="">Choose...</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-farmer text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-farmer/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-gray-500 text-sm font-medium">
          Already a member? 
          <button 
            onClick={() => navigate('/login')}
            className="text-farmer font-black ml-2 hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register
