import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import Toast from '../components/Toast';

const Login = ({ title = "Welcome Back", expectedRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const navigate = useNavigate();

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
    };

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            if (userInfo.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/worker-dashboard');
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });

            // Role Enforcement
            if (expectedRole) {
                if (expectedRole === 'Admin' && data.role !== 'Admin') {
                    showToast('Access Denied: This portal is for Administrators only.', 'error');
                    return;
                }
                if (expectedRole === 'Worker' && data.role === 'Admin') {
                    showToast('Access Denied: Please use the Admin Portal.', 'error');
                    return;
                }
            }

            localStorage.setItem('userInfo', JSON.stringify(data));
            if (data.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/worker-dashboard');
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Invalid email or password', 'error');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-patronum-bg relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[0%] w-[50%] h-[50%] rounded-full bg-patronum-primary/10 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[0%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-[420px] p-8 md:p-10 bg-patronum-card border border-patronum-border rounded-[2rem] shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold mb-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-patronum-primary to-fuchsia-400">
                            {title}
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-patronum-primary transition-colors z-10">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-patronum-bg/50 border-2 border-transparent focus:border-patronum-primary rounded-xl text-white font-medium placeholder-slate-500 transition-all outline-none"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-patronum-primary transition-colors z-10">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-patronum-bg/50 border-2 border-transparent focus:border-patronum-primary rounded-xl text-white font-medium placeholder-slate-500 transition-all outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-patronum-secondary to-patronum-primary hover:from-purple-500 hover:to-violet-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-6"
                    >
                        Sign In <ArrowRight className="h-5 w-5" />
                    </button>
                </form>

                {expectedRole !== 'Admin' && (
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-patronum-secondary hover:text-white font-semibold transition-colors hover:underline">
                                Register here
                            </Link>
                        </p>
                    </div>
                )}
            </div>
            {
                toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                )
            }
        </div >
    );
};

export default Login;
