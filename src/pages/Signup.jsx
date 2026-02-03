import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { User, Mail, Lock, Briefcase, ArrowRight } from 'lucide-react';

import { formatError } from '../utils/errorHandler';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'Video Editor',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/register', formData);
            localStorage.setItem('userInfo', JSON.stringify(data));
            if (data.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/worker-dashboard');
            }
        } catch (error) {
            alert(formatError(error));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050b14] relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[0%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[0%] w-[50%] h-[50%] rounded-full bg-purple-600/5 blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-[420px] p-8 md:p-10 bg-[#0f1218] border border-slate-800 rounded-[2rem] shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            Join the Team
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">Create your workforce account</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-blue-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-blue-500/50 text-white placeholder-slate-600 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="email"
                                name="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-blue-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-blue-500/50 text-white placeholder-slate-600 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-blue-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-blue-500/50 text-white placeholder-slate-600 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Role</label>
                        <div className="relative group">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-blue-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-blue-500/50 text-white transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="Video Editor">Video Editor</option>
                                <option value="Graphic Designer">Graphic Designer</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-white font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-6"
                    >
                        Create Account <ArrowRight className="h-5 w-5" />
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-800/50">
                    <p className="text-slate-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
