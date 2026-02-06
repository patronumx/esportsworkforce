import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const Welcome = () => {
    return (
        <div className="min-h-screen bg-patronum-bg flex flex-col items-center justify-center relative overflow-hidden font-sans text-white p-6">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-patronum-primary/20 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[20%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">

                {/* Header / Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-6 mb-20"
                >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-patronum-card to-patronum-bg border border-patronum-border shadow-2xl flex items-center justify-center p-3 relative group">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <img src={logo} alt="Patronum Esports" className="w-full h-full object-contain relative z-10" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-emerald-200 to-emerald-500 drop-shadow-sm">
                            PATRONUM
                        </h1>
                        <p className="text-lg md:text-xl text-emerald-400 font-medium tracking-[0.3em] uppercase ml-1">
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
                            className="h-full bg-patronum-card/50 backdrop-blur-xl border border-patronum-border hover:border-patronum-primary/70 rounded-3xl p-8 transition-all duration-300 hover:shadow-[0_0_40px_-5px_rgba(124,58,237,0.3)] hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-patronum-primary/10 rounded-full blur-3xl group-hover:bg-patronum-primary/20 transition-all"></div>

                            <div className="w-14 h-14 rounded-2xl bg-patronum-primary/10 text-patronum-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-patronum-primary/20">
                                <Users size={28} />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-patronum-secondary transition-colors">Workforce Login</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Access your assigned tasks, schedule, and workspace tools. Designed for Editors and Designers.
                            </p>

                            <div className="flex items-center text-patronum-primary font-bold group-hover:gap-2 transition-all">
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
                            className="h-full bg-patronum-card/50 backdrop-blur-xl border border-patronum-border hover:border-fuchsia-500/70 rounded-3xl p-8 transition-all duration-300 hover:shadow-[0_0_40px_-5px_rgba(168,85,247,0.3)] hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl group-hover:bg-fuchsia-500/20 transition-all"></div>

                            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-fuchsia-500/20">
                                <ShieldCheck size={28} />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-fuchsia-400 transition-colors">Admin Login</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Manage team members, assign tasks, and oversee project workflows. Restricted access.
                            </p>

                            <div className="flex items-center text-fuchsia-400 font-bold group-hover:gap-2 transition-all">
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
