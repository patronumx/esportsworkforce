import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const Welcome = () => {
    return (
        <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center relative overflow-hidden font-sans text-white p-6">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">

                {/* Header / Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-6 mb-20"
                >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl flex items-center justify-center p-3 relative group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <img src={logo} alt="Patronum Esports" className="w-full h-full object-contain relative z-10" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 drop-shadow-sm">
                            PATRONUM
                        </h1>
                        <p className="text-lg md:text-xl text-blue-400 font-medium tracking-[0.3em] uppercase ml-1">
                            Esports Workforce
                        </p>
                    </div>
                </motion.div>

                {/* Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">

                    {/* Workforce Card */}
                    <Link to="/login" className="group">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>

                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
                                <Users size={28} />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Workforce Login</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Access your assigned tasks, schedule, and workspace tools. Designed for Editors and Designers.
                            </p>

                            <div className="flex items-center text-blue-400 font-bold group-hover:gap-2 transition-all">
                                Enter Portal <ArrowRight size={18} className="ml-2" />
                            </div>
                        </motion.div>
                    </Link>

                    {/* Admin Card */}
                    <Link to="/admin-login" className="group">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 hover:border-purple-500/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>

                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                                <ShieldCheck size={28} />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Admin Login</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Manage team members, assign tasks, and oversee project workflows. Restricted access.
                            </p>

                            <div className="flex items-center text-purple-400 font-bold group-hover:gap-2 transition-all">
                                Enter Portal <ArrowRight size={18} className="ml-2" />
                            </div>
                        </motion.div>
                    </Link>

                </div>

            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-slate-600 text-xs font-medium tracking-widest uppercase opacity-50">
                Patronum Esports System v1.0
            </div>
        </div>
    );
};

export default Welcome;
