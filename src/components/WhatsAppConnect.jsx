import { useState, useEffect } from 'react';
import { QrCode, Smartphone, RefreshCw, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import QRCode from 'react-qr-code';

const WhatsAppConnect = () => {
    const [status, setStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('whatsappNotifyNumber') || '');
    const [notificationStatus, setNotificationStatus] = useState(null);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        localStorage.setItem('whatsappNotifyNumber', phoneNumber);
    }, [phoneNumber]);

    const fetchStatus = async () => {
        try {
            const { data } = await api.get('/whatsapp/status');
            setStatus(data.status);
            setQrCode(data.qr);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch WhatsApp status', error);
            setLoading(false);
        }
    };

    const handleSendNotification = async () => {
        if (!phoneNumber) return;
        setNotificationStatus('sending');
        try {
            await api.post('/whatsapp/send', {
                number: phoneNumber,
                message: "Task Completed: A task has been marked as complete. Please check the dashboard."
            });
            setNotificationStatus('success');
            setTimeout(() => setNotificationStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setNotificationStatus('error');
            setTimeout(() => setNotificationStatus(null), 3000);
        }
    };

    return (
        <div className="bg-[#0f1218] rounded-2xl border border-slate-800 p-6 flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Smartphone className="text-emerald-500" /> WhatsApp Integration
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center">
                {loading ? (
                    <RefreshCw className="animate-spin text-slate-500" />
                ) : status === 'connected' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                            <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-1">Connected</h4>
                            <p className="text-sm text-slate-400">WhatsApp is linked and ready for notifications.</p>
                        </div>

                        <div className="w-full max-w-xs mx-auto space-y-4 pt-6 border-t border-slate-800">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 text-left ml-1">Notify Number</label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="e.g. 923001234567"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/50"
                                />
                                <p className="text-[10px] text-slate-500 text-left mt-1 ml-1">Enter number with country code (no +)</p>
                            </div>

                            <button
                                onClick={handleSendNotification}
                                disabled={!phoneNumber || notificationStatus === 'sending'}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {notificationStatus === 'sending' ? (
                                    <RefreshCw size={18} className="animate-spin" />
                                ) : notificationStatus === 'success' ? (
                                    <> <CheckCircle size={18} /> Sent! </>
                                ) : notificationStatus === 'error' ? (
                                    <> <AlertTriangle size={18} /> Failed </>
                                ) : (
                                    <> <Send size={18} /> Send Test Notification </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div className="flex flex-col items-center space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-2xl">
                            {qrCode ? (
                                <QRCode value={qrCode} size={200} />
                            ) : (
                                <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-100 rounded text-slate-400 text-xs">
                                    Loading QR...
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <h4 className="text-white font-medium mb-1">Scan to Connect</h4>
                            <p className="text-slate-500 text-sm max-w-[250px]">Open WhatsApp → Linked Devices → Link a Device and scan code.</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default WhatsAppConnect;
