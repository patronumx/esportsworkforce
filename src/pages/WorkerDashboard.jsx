import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../utils/api';
import { LogOut, Upload, CheckCircle, Clock, AlertCircle, FileText, Download, Calendar as CalendarIcon, X, Image as ImageIcon, ExternalLink, User, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import ScheduleView from '../components/ScheduleView';
import Toast from '../components/Toast';
import logo from '../assets/logo.png';

const WorkerDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [user, setUser] = useState(null);
    const [submissionLink, setSubmissionLink] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeTab, setActiveTab] = useState('tasks');
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [descriptionModal, setDescriptionModal] = useState({ show: false, task: null });
    const [feedbackTaskId, setFeedbackTaskId] = useState(null);
    const navigate = useNavigate();

    // Profile State
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        bio: '',
        portfolioLink: '',
        skills: '',
        avatar: ''
    });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/');
        } else {
            setUser(userInfo);
            setProfileData({
                username: userInfo.username || '',
                email: userInfo.email || '',
                bio: userInfo.bio || '',
                portfolioLink: userInfo.portfolioLink || '',
                skills: userInfo.skills ? userInfo.skills.join(', ') : '',
                avatar: userInfo.avatar || ''
            });
            fetchTasks();
        }
    }, [navigate]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = {
                ...profileData,
                skills: profileData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
            };

            const { data } = await api.put('/auth/profile', updatedUser);

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser({ ...data }); // Ensure new object reference

            // Update profile form data to match confirmed backend data
            setProfileData(prev => ({
                ...prev,
                username: data.username,
                email: data.email,
                bio: data.bio,
                portfolioLink: data.portfolioLink,
                skills: data.skills ? data.skills.join(', ') : '',
                avatar: data.avatar
            }));

            showToast('Profile updated! Your changes have been saved.', 'success');
        } catch (error) {
            console.error('Profile update failed', error);
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
        }
    };

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks/assigned');
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const handleSubmitWork = async (taskId, fileUrl) => {
        try {
            const submittedData = {
                submission: { fileUrl },
                status: 'Submitted',
                submissionTime: new Date()
            };

            const { data } = await api.put(`/tasks/${taskId}`, submittedData);

            setTasks(tasks.map(t => t._id === taskId ? data : t));
            setToast({ show: true, message: 'Work submitted successfully!', type: 'success' });
        } catch (error) {
            console.error('Failed to submit work', error);
            setToast({ show: true, message: 'Failed to submit work', type: 'error' });
        }
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            fetchTasks(); // Refresh list
        } catch (error) {
            console.error('Failed to update status', error);
            setToast({ show: true, message: 'Failed to update task status', type: 'error' });
        }
    };

    const handleSubmissionUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('files', file);

        try {
            const { data } = await api.post('/upload', formData); // Axios handles multipart/form-data
            if (data.urls && data.urls.length > 0) {
                setSubmissionLink(data.urls[0]);
                setToast({ show: true, message: 'File uploaded successfully!', type: 'success' });
            }
        } catch (error) {
            console.error('Submission upload failed', error);
            setToast({ show: true, message: 'Failed to upload file', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('files', file);

        try {
            const { data } = await api.post('/upload', formData);
            if (data.urls && data.urls.length > 0) {
                setProfileData(prev => ({ ...prev, avatar: data.urls[0] }));
                setToast({ show: true, message: 'Avatar uploaded! Click Save to apply.', type: 'success' });
            }
        } catch (error) {
            console.error('Avatar upload failed', error);
            setToast({ show: true, message: 'Failed to upload avatar', type: 'error' });
        } finally {
            setUploading(false);
        }
    };



    return (
        <div className="flex h-screen bg-[#050b14] text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
            </div>

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-20"
            >
                <div className="p-8 flex items-center gap-4">
                    <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                    <div>
                        <h1 className="text-base font-black text-white leading-none tracking-wide">
                            PATRONUM
                        </h1>
                        <span className="text-sm font-bold text-blue-400 leading-none tracking-wider">
                            ESPORTS
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                    >
                        <FileText size={20} className={activeTab === 'tasks' ? 'text-blue-400' : ''} />
                        <span className="font-medium">My Tasks</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'schedule' ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                    >
                        <CalendarIcon size={20} className={activeTab === 'schedule' ? 'text-blue-400' : ''} />
                        <span className="font-medium">Schedule</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'performance' ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                    >
                        <Activity size={20} className={activeTab === 'performance' ? 'text-blue-400' : ''} />
                        <span className="font-medium">Performance</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                    >
                        <User size={20} className={activeTab === 'profile' ? 'text-blue-400' : ''} />
                        <span className="font-medium">Profile</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                user?.username?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold truncate">{user?.username}</h3>
                            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto z-10 p-8 flex flex-col">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">
                            {activeTab === 'tasks' ? 'My Tasks' : activeTab === 'schedule' ? 'Schedule' : activeTab === 'performance' ? 'Performance' : 'My Profile'}
                        </h2>
                        <p className="text-slate-400">
                            {activeTab === 'tasks' ? 'Manage your assigned work.' : activeTab === 'schedule' ? 'View your upcoming deadlines.' : activeTab === 'performance' ? 'Track your productivity stats.' : 'Manage your account details.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800 text-sm text-slate-300 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                        </div>
                    </div>
                </header>

                <div className="flex-1 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800/50 overflow-hidden shadow-2xl relative flex flex-col">
                    {activeTab === 'tasks' ? (
                        /* TASKS TAB: Table View */
                        <div className="p-8 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-800/50 pb-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                                    <FileText className="text-purple-400" /> Assigned Tasks
                                </h3>
                                <div className="text-sm text-slate-400">{tasks.length} Total Tasks</div>
                            </div>

                            <div className="flex-1 overflow-auto custom-scrollbar bg-slate-800/20 rounded-2xl border border-slate-700/50">
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-900/50 text-slate-200 sticky top-0 z-10 backdrop-blur-md">
                                        <tr>
                                            <th className="p-4 font-semibold">Title</th>
                                            <th className="p-4 font-semibold">Description</th>
                                            <th className="p-4 font-semibold">Deadline</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {tasks.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="p-12 text-center text-slate-500">
                                                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                                    No tasks assigned yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map(task => (
                                                <tr key={task._id} className="hover:bg-slate-800/30 transition-colors group">
                                                    <td className="p-4 align-top max-w-xs">
                                                        <h4 className="text-white font-medium text-base mb-1 group-hover:text-blue-400 transition-colors">{task.title}</h4>
                                                        {(() => {
                                                            const allAssets = [...(task.assets || []), ...(task.media || [])];
                                                            if (allAssets.length === 0) return null;

                                                            const getAssetLabel = (url) => {
                                                                const ext = url.split('.').pop().toLowerCase();
                                                                if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'Image';
                                                                if (['mp4', 'mov', 'webm'].includes(ext)) return 'Video';
                                                                return 'Link';
                                                            };

                                                            return (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {allAssets.map((asset, i) => (
                                                                        <a key={i} href={asset} target="_blank" rel="noreferrer"
                                                                            className="text-[10px] bg-slate-700/50 hover:bg-slate-700 text-blue-300 px-2 py-1 rounded border border-slate-600/30 transition-colors flex items-center gap-1">
                                                                            {getAssetLabel(asset) === 'Link' ? <ExternalLink size={10} /> : <ImageIcon size={10} />}
                                                                            {getAssetLabel(asset)}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="p-4 align-top max-w-sm">
                                                        <p
                                                            className="text-slate-400 text-xs line-clamp-2 cursor-pointer hover:text-blue-400 transition-colors"
                                                            title="Click to view full description"
                                                            onClick={() => setDescriptionModal({ show: true, task })}
                                                        >
                                                            {task.description || '-'}
                                                        </p>
                                                    </td>
                                                    <td className="p-4 align-top whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-300 font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
                                                            <span className="text-xs text-slate-500">{new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-top">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                            ${task.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                task.status === 'Submitted' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                    task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                        task.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                            'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 align-top text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {task.status === 'Pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(task._id, 'In Progress')}
                                                                        className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold transition-all"
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(task._id, 'Rejected')}
                                                                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-all"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}

                                                            {task.status === 'In Progress' && (
                                                                <button
                                                                    onClick={() => setSelectedTask(selectedTask?._id === task._id ? null : task)}
                                                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
                                                                >
                                                                    {selectedTask?._id === task._id ? 'Cancel' : 'Submit'}
                                                                </button>
                                                            )}

                                                            {(task.status === 'Completed' || task.status === 'Submitted') && !task.remarks && (
                                                                <span className="text-xs text-slate-500 italic py-1.5">No actions</span>
                                                            )}

                                                            {(task.remarks || task.remarkFile) && (
                                                                <button
                                                                    onClick={() => setFeedbackTaskId(feedbackTaskId === task._id ? null : task._id)}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${feedbackTaskId === task._id ? 'bg-purple-500 text-white border-purple-500' : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/30'}`}
                                                                >
                                                                    {feedbackTaskId === task._id ? 'Hide Feedback' : 'View Feedback'}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Feedback Section */}
                                                        <AnimatePresence>
                                                            {feedbackTaskId === task._id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                    className="overflow-hidden text-left"
                                                                >
                                                                    <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/20 space-y-3">
                                                                        <div>
                                                                            <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Admin Remarks</h5>
                                                                            <p className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                                                                {task.remarks || "No text remarks provided."}
                                                                            </p>
                                                                        </div>
                                                                        {task.remarkFile && (
                                                                            <div>
                                                                                <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Attached Feedback File</h5>
                                                                                <div className="flex items-center gap-3">
                                                                                    {task.remarkFile.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                                                        <a href={task.remarkFile} target="_blank" rel="noreferrer" className="block w-32 h-20 rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500 transition-colors relative group">
                                                                                            <img src={task.remarkFile} alt="Feedback" className="w-full h-full object-cover" />
                                                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                <Download size={16} className="text-white" />
                                                                                            </div>
                                                                                        </a>
                                                                                    ) : (
                                                                                        <a href={task.remarkFile} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-700 hover:border-purple-500 rounded-lg text-slate-300 hover:text-white transition-colors">
                                                                                            <FileText size={16} />
                                                                                            <span className="text-sm font-medium">Download Feedback File</span>
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        {/* Inline Submission Form */}
                                                        <AnimatePresence>
                                                            {selectedTask?._id === task._id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                    className="overflow-hidden text-left"
                                                                >
                                                                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                                                                        <div className="flex gap-2 items-center">
                                                                            <div className="relative">
                                                                                <input
                                                                                    type="file"
                                                                                    id="submission-upload"
                                                                                    className="hidden"
                                                                                    onChange={handleSubmissionUpload}
                                                                                    disabled={uploading}
                                                                                />
                                                                                <label
                                                                                    htmlFor="submission-upload"
                                                                                    className={`p-2 rounded-lg border border-slate-700 cursor-pointer transition-colors flex items-center justify-center ${uploading ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-blue-500/30'}`}
                                                                                    title="Upload File"
                                                                                >
                                                                                    {uploading ? (
                                                                                        <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                                                                    ) : (
                                                                                        <Upload size={16} />
                                                                                    )}
                                                                                </label>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                value={submissionLink}
                                                                                onChange={(e) => setSubmissionLink(e.target.value)}
                                                                                placeholder={uploading ? "Uploading..." : "Submission URL..."}
                                                                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                                                                                readOnly={uploading}
                                                                            />
                                                                            <button
                                                                                onClick={() => handleSubmitWork(task._id)}
                                                                                disabled={uploading || !submissionLink}
                                                                                className={`px-4 py-2 rounded-lg text-white text-xs font-bold transition-all ${uploading || !submissionLink ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
                                                                            >
                                                                                Send
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        /* PERFORMANCE TAB */
                    ) : activeTab === 'performance' ? (
                        <div className="p-8 h-full flex flex-col overflow-y-auto custom-scrollbar space-y-8">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                                    <div className="text-slate-400 text-sm font-medium mb-1">Total Assigned</div>
                                    <div className="text-3xl font-bold text-white">{tasks.length}</div>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                                    <div className="text-slate-400 text-sm font-medium mb-1">Completed</div>
                                    <div className="text-3xl font-bold text-emerald-400">{tasks.filter(t => t.status === 'Completed').length}</div>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                                    <div className="text-slate-400 text-sm font-medium mb-1">Pending</div>
                                    <div className="text-3xl font-bold text-blue-400">{tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length}</div>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                                    <div className="text-slate-400 text-sm font-medium mb-1">Completion Rate</div>
                                    <div className="text-3xl font-bold text-purple-400">
                                        {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0}%
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                                <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-6">Task Status Distribution</h3>
                                    <div className="flex-1 min-h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={[
                                                    { name: 'Pending', value: tasks.filter(t => t.status === 'Pending').length, fill: '#94a3b8' },
                                                    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, fill: '#3b82f6' },
                                                    { name: 'Submitted', value: tasks.filter(t => t.status === 'Submitted').length, fill: '#eab308' },
                                                    { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, fill: '#10b981' },
                                                    { name: 'Rejected', value: tasks.filter(t => t.status === 'Rejected').length, fill: '#ef4444' },
                                                ]}
                                                layout="vertical"
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                                                <XAxis type="number" stroke="#94a3b8" />
                                                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                                    itemStyle={{ color: '#f8fafc' }}
                                                />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-6">Overall Progress</h3>
                                    <div className="flex-1 min-h-[300px] flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length },
                                                        { name: 'Remaining', value: tasks.filter(t => t.status !== 'Completed').length }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={120}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    <Cell key="cell-0" fill="#10b981" />
                                                    <Cell key="cell-1" fill="#334155" />
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'schedule' ? (
                        /* CALENDAR TAB: New Timeline View */
                        <div className="h-full p-6">
                            <ScheduleView tasks={tasks} />
                        </div>
                    ) : (
                        /* PROFILE TAB */
                        <div className="p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">
                            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                                <User className="text-blue-400" /> My Profile
                            </h2>
                            <form onSubmit={handleProfileUpdate} className="max-w-2xl space-y-6">
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center relative group">
                                        {profileData.avatar ? (
                                            <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-slate-600">{profileData.username?.charAt(0).toUpperCase()}</span>
                                        )}
                                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Upload className="text-white" size={24} />
                                        </label>
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload} // Reusing upload logic or need new handler?
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">Profile Photo</h3>
                                        <p className="text-sm text-slate-400">Click to upload. PNG, JPG up to 5MB.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Username</label>
                                        <input
                                            type="text"
                                            value={profileData.username}
                                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            readOnly
                                            className="w-full bg-slate-900/50 border border-slate-800/50 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Bio</label>
                                    <textarea
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        rows={4}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Portfolio Link</label>
                                    <div className="relative">
                                        <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="url"
                                            value={profileData.portfolioLink}
                                            onChange={(e) => setProfileData({ ...profileData, portfolioLink: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500/50"
                                            placeholder="https://yourportfolio.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Skills <span className="text-xs text-slate-500">(Comma separated)</span></label>
                                    <input
                                        type="text"
                                        value={profileData.skills}
                                        onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50"
                                        placeholder="Video Editing, Premiere Pro, After Effects"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        Save Profile
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>


            </main>

            {/* Description Modal */}
            <AnimatePresence>
                {descriptionModal.show && descriptionModal.task && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDescriptionModal({ show: false, task: null })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#0f1218] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800/50 flex justify-between items-start gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{descriptionModal.task.title}</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Task Description</p>
                                </div>
                                <button
                                    onClick={() => setDescriptionModal({ show: false, task: null })}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {descriptionModal.task.description || 'No description provided.'}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-900/50 border-t border-slate-800/50 flex justify-end">
                                <button
                                    onClick={() => setDescriptionModal({ show: false, task: null })}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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

export default WorkerDashboard;
