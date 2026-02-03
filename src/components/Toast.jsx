import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed top-6 right-6 z-50">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md
                        ${type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'}
                    `}
                >
                    <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <h4 className="font-semibold text-sm">{type === 'success' ? 'Success' : 'Error'}</h4>
                        <p className={`text-xs ${type === 'success' ? 'text-green-400/80' : 'text-red-400/80'}`}>
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className={`p-1 rounded-lg transition-colors ${type === 'success' ? 'hover:bg-green-500/20' : 'hover:bg-red-500/20'}`}
                    >
                        <X size={14} />
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Toast;
