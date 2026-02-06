import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, Plus, Search, Calendar as CalendarIcon, User, CheckCircle, Clock, AlertTriangle, ExternalLink, Image as ImageIcon, Link as LinkIcon, X, Upload, LayoutDashboard, ClipboardList, Minus, Filter, Trash2, MessageSquare, Edit, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';
import ChatInterface from '../components/ChatInterface';
import logo from '../assets/logo.png';

const AdminDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [teamStats, setTeamStats] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    // 'dashboard' | 'assign-task' | 'history' | 'assets' | 'team'
    const [activeView, setActiveView] = useState('dashboard');
    const [uploading, setUploading] = useState(false);
    const [assetLinkInput, setAssetLinkInput] = useState('');
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignedTo: '',
        deadline: '',
        assets: [], // Array of links
        media: [] // Array of media URLs
    });
    // Review Modal State
    const [reviewModal, setReviewModal] = useState({ show: false, task: null });
    const [deleteModal, setDeleteModal] = useState({ show: false, assetUrl: null, taskId: null, fieldType: null });
    const [descriptionModal, setDescriptionModal] = useState({ show: false, task: null });
    const [openAssetDropdownId, setOpenAssetDropdownId] = useState(null);
    const [reviewRemark, setReviewRemark] = useState('');
    const [reviewFile, setReviewFile] = useState(''); // URL for uploaded remark file
    const [reviewUploading, setReviewUploading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [isEditingMember, setIsEditingMember] = useState(false);
    const [editMemberData, setEditMemberData] = useState({});
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
    // Custom Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Confirm',
        type: 'danger' // 'danger' | 'warning' | 'primary'
    });
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            navigate('/');
        } else {
            fetchData();
            fetchTeamStats();
            fetchUsers();
            fetchUnreadCount();
        }
    }, [navigate]);

    // Poll for unread messages
    useEffect(() => {
        const interval = setInterval(fetchUnreadCount, 5000); // Check every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.get('/chat/unread/count');
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    };

    const fetchData = async () => {
        try {
            const [tasksRes] = await Promise.all([
                api.get('/tasks'),
            ]);
            setTasks(tasksRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const fetchTeamStats = async () => {
        try {
            const { data } = await api.get('/auth/team-stats');
            setTeamStats(data);
        } catch (error) {
            console.error('Failed to fetch team stats', error);
        }
    };

    const handleAddLink = () => {
        if (!assetLinkInput.trim()) return;
        setNewTask({ ...newTask, assets: [...newTask.assets, assetLinkInput.trim()] });
        setAssetLinkInput('');
    };

    const handleRemoveLink = (index) => {
        setNewTask({ ...newTask, assets: newTask.assets.filter((_, i) => i !== index) });
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', newTask);

            // Allow user to stay or go back? Let's go back to dashboard to see the task.
            setActiveView('dashboard');

            setNewTask({ title: '', description: '', assignedTo: '', deadline: '', assets: [], media: [] });
            fetchData();
            showToast('Task Created!', 'success');
        } catch (error) {
            showToast('Failed to create task', 'error');
        }
    };

    const handleReviewUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setReviewUploading(true);
        const formData = new FormData();
        formData.append('files', file);

        try {
            const { data } = await api.post('/upload', formData);
            if (data.urls && data.urls.length > 0) {
                setReviewFile(data.urls[0]);
            }
        } catch (error) {
            console.error('Review upload failed', error);
            showToast('Failed to upload remark file', 'error');
        } finally {
            setReviewUploading(false);
        }
    };

    const handleReviewSubmit = async (status) => {
        if (!reviewModal.task) return;
        try {
            await api.put(`/tasks/${reviewModal.task._id}`, {
                status,
                remarks: reviewRemark,
                remarkFile: reviewFile
            });
            setReviewModal({ show: false, task: null });
            setReviewRemark('');
            setReviewFile('');
            fetchData();
            showToast(`Task ${status}!`, 'success');
        } catch (error) {
            console.error('Failed to update task', error);
            showToast('Failed to update task status', 'error');
        }
    };

    const handleStartEdit = (member) => {
        setEditMemberData({
            ...member,
            skills: member.skills ? member.skills.join(', ') : ''
        });
        setIsEditingMember(true);
    };

    const handleUpdateMember = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                ...editMemberData,
                skills: typeof editMemberData.skills === 'string' ? editMemberData.skills.split(',').map(s => s.trim()) : editMemberData.skills
            };

            const { data } = await api.put(`/auth/${editMemberData._id}`, updatedData);

            setTeamStats(teamStats.map(m => m._id === data._id ? { ...m, ...data, stats: m.stats } : m));
            setSelectedMember({ ...data, stats: selectedMember.stats });
            setIsEditingMember(false);
            showToast('Member profile updated successfully');
        } catch (error) {
            console.error('Failed to update member', error);
            showToast('Failed to update member', 'error');
        }
    };

    const handleDeleteMember = async (memberId) => {
        setConfirmModal({
            show: true,
            title: 'Delete Team Member',
            message: 'Are you sure you want to remove this member? This action cannot be undone.',
            confirmText: 'Delete Member',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/auth/${memberId}`);
                    setTeamStats(teamStats.filter(m => m._id !== memberId));
                    setSelectedMember(null);
                    showToast('Team member removed successfully');
                } catch (error) {
                    console.error('Failed to delete member', error);
                    showToast('Failed to delete member', 'error');
                }
                setConfirmModal(prev => ({ ...prev, show: false }));
            }
        });
    };

    const handleAdminAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('files', file);

        try {
            const { data } = await api.post('/upload', formData);
            if (data.urls && data.urls.length > 0) {
                setEditMemberData(prev => ({ ...prev, avatar: data.urls[0] }));
                showToast('Avatar uploaded! Click Save to apply.');
            }
        } catch (error) {
            console.error('Avatar upload failed', error);
            showToast('Failed to upload avatar', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleGlobalAssetDelete = (assetUrl, taskId, fieldType) => {
        setDeleteModal({ show: true, assetUrl, taskId, fieldType });
    };

    const confirmDelete = async () => {
        const { assetUrl, taskId, fieldType } = deleteModal;
        if (!assetUrl || !taskId) return;

        try {
            // 1. Delete from Cloudinary
            // 1. Delete from Cloudinary
            const publicId = getPublicIdFromUrl(assetUrl);
            const isVideo = assetUrl.includes('/video/upload/');
            const resourceType = isVideo ? 'video' : 'image';

            if (publicId) {
                await api.delete('/upload', { data: { publicId, resourceType } });
            }

            // 2. Update Task in DB
            const task = tasks.find(t => t._id === taskId);
            if (!task) return;

            let updates = {};
            if (fieldType === 'assets') {
                updates.assets = task.assets.filter(a => a !== assetUrl);
            } else if (fieldType === 'media') {
                updates.media = task.media.filter(m => m !== assetUrl);
            } else if (fieldType === 'remarkFile') {
                updates.remarkFile = '';
            } else if (fieldType === 'submission') {
                updates.submission = { ...task.submission, fileUrl: '' };
            }

            await api.put(`/tasks/${taskId}`, updates);
            showToast('Asset deleted successfully');
            fetchData();
            setDeleteModal({ show: false, assetUrl: null, taskId: null, fieldType: null });
        } catch (error) {
            console.error('Failed to delete asset', error);
            showToast('Failed to delete asset', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const handleDeleteTask = async (taskId) => {
        setConfirmModal({
            show: true,
            title: 'Remove Task',
            message: 'Are you sure you want to remove this task from your history? It will remain visible to the worker.',
            confirmText: 'Remove Task',
            type: 'warning',
            onConfirm: async () => {
                try {
                    await api.delete(`/tasks/${taskId}`);
                    setToast({ show: true, message: 'Task removed permanently.', type: 'success' });
                    setTasks(prev => prev.filter(t => t._id !== taskId));
                } catch (error) {
                    console.error('Error deleting task:', error);
                    setToast({ show: true, message: 'Failed to delete task.', type: 'error' });
                }
                setConfirmModal(prev => ({ ...prev, show: false }));
            }
        });
    };

    const getPublicIdFromUrl = (url) => {
        try {
            // Example URL: https://res.cloudinary.com/demo/image/upload/v12345678/folder/filename.jpg
            if (!url) return null;
            const splitUrl = url.split('/');
            const filename = splitUrl[splitUrl.length - 1]; // filename.jpg
            const folder = splitUrl[splitUrl.length - 2]; // folder
            const publicId = `${folder}/${filename.split('.')[0]}`;
            return publicId;
        } catch (error) {
            console.error('Error extracting public ID:', error);
            return null;
        }
    };

    const removeMedia = async (indexToRemove) => {
        const urlToDelete = newTask.media[indexToRemove];

        // Optimistically remove from UI
        setNewTask({
            ...newTask,
            media: newTask.media.filter((_, index) => index !== indexToRemove)
        });

        // Trigger Delete in Backend
        const publicId = getPublicIdFromUrl(urlToDelete);
        if (publicId) {
            try {
                // Determine resource type based on extension
                const isVideo = urlToDelete.match(/\.(mp4|mov|webm)$/i);
                await api.delete('/upload', {
                    data: {
                        publicId,
                        resourceType: isVideo ? 'video' : 'image'
                    }
                });
                console.log('Deleted from Cloudinary:', publicId);
            } catch (error) {
                console.error('Failed to delete from Cloudinary:', error);
                // Optionally revert UI if strict consistency is needed,
                // but for UX usually better to just log it.
            }
        }
    };

    return (
        <div className="flex h-screen bg-patronum-bg text-white overflow-hidden relative font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-patronum-primary/10 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[120px] animate-pulse delay-700"></div>
            </div>

            {/* Sidebar */}
            <aside className="w-64 bg-patronum-card/50 backdrop-blur-xl border-r border-patronum-border flex flex-col z-20">
                <div className="p-6 flex items-center gap-3">
                    <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                    <div>
                        <h1 className="text-xs font-bold text-white leading-tight">
                            PATRONUM<br /><span className="text-patronum-secondary">ESPORTS</span>
                        </h1>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 p-4 flex-1">
                    <button
                        onClick={() => setActiveView('dashboard')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold group relative overflow-hidden ${activeView === 'dashboard'
                            ? 'bg-gradient-to-r from-patronum-primary/30 to-fuchsia-600/20 text-white shadow-[0_0_20px_rgba(124,58,237,0.15)] border border-patronum-primary/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {activeView === 'dashboard' && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-patronum-primary rounded-full" />}
                        <LayoutDashboard size={18} className={`${activeView === 'dashboard' ? 'text-patronum-secondary' : 'group-hover:scale-110 transition-transform'}`} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveView('assign-task')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold group relative overflow-hidden ${activeView === 'assign-task'
                            ? 'bg-gradient-to-r from-patronum-primary/30 to-fuchsia-600/20 text-white shadow-[0_0_20px_rgba(124,58,237,0.15)] border border-patronum-primary/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {activeView === 'assign-task' && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-patronum-primary rounded-full" />}
                        <ClipboardList size={18} className={`${activeView === 'assign-task' ? 'text-patronum-secondary' : 'group-hover:scale-110 transition-transform'}`} /> Assign Task
                    </button>
                    <button
                        onClick={() => setActiveView('history')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold group relative overflow-hidden ${activeView === 'history'
                            ? 'bg-gradient-to-r from-patronum-primary/30 to-fuchsia-600/20 text-white shadow-[0_0_20px_rgba(124,58,237,0.15)] border border-patronum-primary/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {activeView === 'history' && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-patronum-primary rounded-full" />}
                        <Clock size={18} className={`${activeView === 'history' ? 'text-patronum-secondary' : 'group-hover:scale-110 transition-transform'}`} /> History
                    </button>
                    <button
                        onClick={() => setActiveView('messages')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold group relative overflow-hidden w-full ${activeView === 'messages'
                            ? 'bg-gradient-to-r from-patronum-primary/30 to-fuchsia-600/20 text-white shadow-[0_0_20px_rgba(124,58,237,0.15)] border border-patronum-primary/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {activeView === 'messages' && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-patronum-primary rounded-full" />}
                        <MessageSquare size={18} className={`${activeView === 'messages' ? 'text-patronum-secondary' : 'group-hover:scale-110 transition-transform'}`} /> Messages
                        {unreadCount > 0 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex justify-center shadow-lg shadow-red-500/20">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveView('assets')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold group relative overflow-hidden ${activeView === 'assets'
                            ? 'bg-gradient-to-r from-patronum-primary/30 to-fuchsia-600/20 text-white shadow-[0_0_20px_rgba(124,58,237,0.15)] border border-patronum-primary/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {activeView === 'assets' && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-patronum-primary rounded-full" />}
                        <ImageIcon size={18} className={`${activeView === 'assets' ? 'text-patronum-secondary' : 'group-hover:scale-110 transition-transform'}`} /> Assets
                    </button>
                    <button
                        onClick={() => setActiveView('team')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold group relative overflow-hidden ${activeView === 'team'
                            ? 'bg-gradient-to-r from-patronum-primary/30 to-fuchsia-600/20 text-white shadow-[0_0_20px_rgba(124,58,237,0.15)] border border-patronum-primary/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {activeView === 'team' && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-patronum-primary rounded-full" />}
                        <User size={18} className={`${activeView === 'team' ? 'text-patronum-secondary' : 'group-hover:scale-110 transition-transform'}`} /> Team
                    </button>
                </nav>

                <div className="p-4 border-t border-patronum-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-patronum-primary to-fuchsia-500 flex items-center justify-center font-bold text-sm text-white">
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">{user?.username || 'Administrator'}</h3>
                            <p className="text-xs text-slate-400">{user?.role || 'Admin'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/10"
                        title="Logout"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-8 relative z-10">
                {activeView === 'dashboard' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                                <p className="text-slate-400">Overview of active tasks and team performance.</p>
                            </div>
                            <button
                                onClick={() => setActiveView('assign-task')}
                                className="px-6 py-2.5 bg-patronum-primary hover:bg-purple-600 rounded-xl text-white font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
                            >
                                <Plus size={18} /> New Task
                            </button>
                        </header>

                        <div className="bg-patronum-card border border-patronum-border rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-patronum-border text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] bg-slate-900/40">
                                            <th className="px-8 py-6">Task Details</th>
                                            <th className="px-8 py-6">Assigned To</th>
                                            <th className="px-8 py-6">Timeline</th>
                                            <th className="px-8 py-6">Status</th>
                                            <th className="px-8 py-6">Submission</th>
                                            <th className="px-8 py-6">Remarks</th>
                                            <th className="px-8 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-patronum-border/50">
                                        {tasks.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="p-12 text-center text-slate-500">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <ClipboardList size={48} className="opacity-20" />
                                                        <p>No tasks found. Create one to get started.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            tasks.filter(t => !t.isHiddenFromAdmin).map(task => (
                                                <tr key={task._id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="font-bold text-white text-[15px] group-hover:text-patronum-secondary transition-colors">{task.title}</span>
                                                            {/* Description Modal Trigger */}
                                                            <button
                                                                onClick={() => setDescriptionModal({ show: true, task })}
                                                                className="text-[10px] text-slate-500 hover:text-patronum-primary transition-colors flex items-center gap-1 w-fit uppercase font-black tracking-widest"
                                                            >
                                                                Details <ExternalLink size={8} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex -space-x-2">
                                                            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 overflow-hidden flex items-center justify-center shadow-lg" title={task.assignedTo?.username}>
                                                                {task.assignedTo?.avatar ? (
                                                                    <img src={task.assignedTo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-slate-500">{task.assignedTo?.username?.charAt(0).toUpperCase()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                                                                <CalendarIcon size={12} className="text-patronum-primary" />
                                                                {new Date(task.deadline).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center justify-center w-fit shadow-lg ${task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' :
                                                            task.status === 'Submitted' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/5' :
                                                                task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${task.status === 'Completed' ? 'bg-emerald-400 animate-pulse' :
                                                                task.status === 'Submitted' ? 'bg-purple-400 animate-pulse' :
                                                                    task.status === 'In Progress' ? 'bg-blue-400 animate-pulse' :
                                                                        'bg-slate-400'
                                                                }`}></span>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {task.submission?.fileUrl ? (
                                                            <div className="flex flex-col gap-2">
                                                                <a
                                                                    href={task.submission.fileUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-2 px-3 py-1.5 bg-patronum-primary/10 text-patronum-secondary hover:bg-patronum-primary/20 border border-patronum-primary/20 rounded-lg transition-colors w-fit"
                                                                    title="View Submitted Work"
                                                                >
                                                                    <ExternalLink size={14} />
                                                                    <span className="text-xs font-bold">View Design</span>
                                                                </a>
                                                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    {new Date(task.submission.submittedAt || task.submissionTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <Minus className="text-slate-700 opacity-50" size={16} />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {task.remarks ? (
                                                            <div className="group relative w-fit">
                                                                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 cursor-help transition-colors border border-purple-500/20">
                                                                    <MessageSquare size={16} />
                                                                </div>
                                                                {/* Tooltip */}
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-patronum-bg border border-patronum-border p-4 rounded-xl shadow-2xl text-xs text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto z-50">
                                                                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-patronum-bg border-b border-r border-patronum-border rotate-45"></div>
                                                                    <h4 className="font-bold mb-2 text-purple-400 uppercase tracking-wider text-[10px]">Admin Remarks</h4>
                                                                    <p className="text-slate-300 leading-relaxed mb-3">"{task.remarks}"</p>
                                                                    {task.remarkFile && (
                                                                        <div className="pt-3 border-t border-patronum-border">
                                                                            <a href={task.remarkFile} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 group/link">
                                                                                <LinkIcon size={12} />
                                                                                <span className="font-medium">View Attachment</span>
                                                                                <ExternalLink size={10} className="ml-auto opacity-50 group-hover/link:opacity-100" />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-2 text-slate-700 opacity-20">
                                                                <MessageSquare size={16} />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex justify-end gap-2 items-center">
                                                            {task.status === 'Completed' && (
                                                                <button
                                                                    onClick={() => handleDeleteTask(task._id)}
                                                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                                                                    title="Remove from History"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}

                                                            {task.status === 'Submitted' && (
                                                                <button
                                                                    onClick={() => setReviewModal({ show: true, task })}
                                                                    className="px-3 py-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                                                                >
                                                                    <CheckCircle size={12} /> Review
                                                                </button>
                                                            )}

                                                            {/* Assets Display Logic */}
                                                            {(() => {
                                                                // Combine legacy assets and new media
                                                                const allAssets = [
                                                                    ...(task.media || []),
                                                                    ...(task.assets || [])
                                                                ].filter(Boolean);

                                                                if (allAssets.length === 0) return null;

                                                                if (allAssets.length === 1) {
                                                                    return (
                                                                        <a
                                                                            href={allAssets[0]}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700/50"
                                                                            title="View Asset"
                                                                        >
                                                                            <LinkIcon size={16} />
                                                                        </a>
                                                                    );
                                                                }

                                                                return (
                                                                    <div className="relative">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setOpenAssetDropdownId(openAssetDropdownId === task._id ? null : task._id);
                                                                            }}
                                                                            className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg transition-colors text-xs font-bold ${openAssetDropdownId === task._id
                                                                                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                                                                                : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border-blue-500/20'
                                                                                }`}
                                                                        >
                                                                            <ImageIcon size={14} />
                                                                            <span>{allAssets.length} Assets</span>
                                                                        </button>

                                                                        {/* Click-Triggered Dropdown */}
                                                                        {openAssetDropdownId === task._id && (
                                                                            <>
                                                                                <div
                                                                                    className="fixed inset-0 z-40"
                                                                                    onClick={() => setOpenAssetDropdownId(null)}
                                                                                ></div>
                                                                                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-2 py-1 mb-1">Attached Files</div>
                                                                                    <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                                                                                        {allAssets.map((url, i) => (
                                                                                            <a
                                                                                                key={i}
                                                                                                href={url}
                                                                                                target="_blank"
                                                                                                rel="noreferrer"
                                                                                                onClick={() => setOpenAssetDropdownId(null)}
                                                                                                className="flex items-center gap-2 px-2 py-2 hover:bg-slate-800 rounded-lg text-xs text-slate-300 hover:text-white transition-colors truncate"
                                                                                            >
                                                                                                <ExternalLink size={12} />
                                                                                                Asset {i + 1}
                                                                                            </a>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table >
                            </div >
                        </div >
                    </motion.div >
                )}
                {
                    activeView === 'messages' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-6xl mx-auto h-full"
                        >
                            <ChatInterface currentUser={user} />
                        </motion.div>
                    )
                }

                {
                    activeView === 'assign-task' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <header className="mb-10 text-center">
                                <h3 className="text-[10px] font-black text-patronum-primary uppercase tracking-[0.3em] mb-4">Task Delegation</h3>
                                <h2 className="text-4xl font-black text-white mb-2">Assign New Project</h2>
                                <p className="text-slate-500">Deploy resources to specific team members.</p>
                            </header>

                            <div className="bg-patronum-card/40 backdrop-blur-xl border border-patronum-border/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-patronum-primary to-fuchsia-600"></div>
                                <form onSubmit={handleCreateTask} className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Task Title <span className="text-red-400">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            value={newTask.title}
                                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                            className="w-full bg-patronum-bg border-2 border-transparent focus:border-patronum-primary/50 rounded-xl px-4 py-3 text-white focus:bg-patronum-bg outline-none transition-all placeholder-slate-600"
                                            placeholder="e.g. Tekken 8 Tournament Highlights"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Assign To <span className="text-red-400">*</span></label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                                                    className="w-full bg-patronum-bg border-2 border-transparent focus:border-patronum-primary/50 rounded-xl px-4 py-3 text-white outline-none flex items-center justify-between transition-all group hover:border-slate-700"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {newTask.assignedTo ? (
                                                            (() => {
                                                                const selectedUser = users.find(u => u._id === newTask.assignedTo);
                                                                return (
                                                                    <>
                                                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                                                                            {selectedUser?.avatar ? (
                                                                                <img src={selectedUser.avatar} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <span className="text-xs font-bold text-slate-500">{selectedUser?.username?.charAt(0).toUpperCase()}</span>
                                                                            )}
                                                                        </div>
                                                                        <span className="font-medium text-slate-200">{selectedUser?.username || 'Unknown User'}</span>
                                                                    </>
                                                                );
                                                            })()
                                                        ) : (
                                                            <span className="text-slate-500 group-hover:text-slate-400 transition-colors">Select Worker...</span>
                                                        )}
                                                    </div>
                                                    <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${isAssignDropdownOpen ? 'rotate-180 text-patronum-primary' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {isAssignDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="absolute top-full left-0 w-full mt-2 bg-[#0f1218] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/5"
                                                        >
                                                            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                                                                {users.filter(u => u.role !== 'Admin').map(u => (
                                                                    <button
                                                                        key={u._id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setNewTask({ ...newTask, assignedTo: u._id });
                                                                            setIsAssignDropdownOpen(false);
                                                                        }}
                                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border border-transparent ${newTask.assignedTo === u._id
                                                                            ? 'bg-patronum-primary/10 border-patronum-primary/20 text-white'
                                                                            : 'hover:bg-slate-800/50 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border ${newTask.assignedTo === u._id ? 'border-patronum-primary/30' : 'border-slate-700 bg-slate-800'}`}>
                                                                            {u.avatar ? (
                                                                                <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <span className="text-xs font-bold text-slate-500">{u.username.charAt(0).toUpperCase()}</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-left flex-1">
                                                                            <div className={`font-medium text-sm ${newTask.assignedTo === u._id ? 'text-patronum-primary' : ''}`}>{u.username}</div>
                                                                            <div className="text-[10px] opacity-60 uppercase tracking-wider">{u.role}</div>
                                                                        </div>
                                                                        {newTask.assignedTo === u._id && (
                                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center justify-center w-5 h-5 rounded-full bg-patronum-primary text-white">
                                                                                <CheckCircle size={12} />
                                                                            </motion.div>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Deadline <span className="text-red-400">*</span></label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="datetime-local"
                                                    value={newTask.deadline}
                                                    onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                                                    className="w-full bg-patronum-bg border-2 border-transparent focus:border-patronum-primary/50 rounded-xl px-4 py-3 text-white outline-none [color-scheme:dark] cursor-pointer"
                                                />
                                                <div className="absolute right-4 top-3.5 pointer-events-none text-patronum-primary">
                                                    <CalendarIcon size={18} />
                                                </div>
                                                {/* Hide default icon but keep functionality accessible via clicking the input */}
                                                <style>{`
                                                    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
                                                        opacity: 0;
                                                        cursor: pointer;
                                                        width: 100%;
                                                        height: 100%;
                                                        position: absolute;
                                                        top: 0;
                                                        left: 0;
                                                    }
                                                `}</style>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Description</label>
                                        <textarea
                                            rows="4"
                                            value={newTask.description}
                                            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                            className="w-full bg-patronum-bg border-2 border-transparent focus:border-patronum-primary/50 rounded-xl px-4 py-3 text-white outline-none resize-none placeholder-slate-600"
                                            placeholder="Add detailed instructions..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Assets Links</label>
                                        <div className="space-y-3">
                                            <div className="relative flex gap-2">
                                                <div className="relative flex-1">
                                                    <LinkIcon className="absolute left-4 top-3.5 text-slate-500 w-4 h-4" />
                                                    <input
                                                        type="url"
                                                        value={assetLinkInput}
                                                        onChange={e => setAssetLinkInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                                                        placeholder="https://drive.google.com..."
                                                        className="w-full bg-patronum-bg border-2 border-transparent focus:border-patronum-primary/50 rounded-xl pl-10 pr-4 py-3 text-white outline-none placeholder-slate-600"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleAddLink}
                                                    className="px-4 py-2 bg-patronum-primary/10 text-patronum-primary border border-patronum-primary/20 rounded-xl hover:bg-patronum-primary/20 transition-colors"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>

                                            {/* Added Links List */}
                                            {newTask.assets.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {newTask.assets.map((link, index) => (
                                                        <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-patronum-bg border border-patronum-border rounded-lg text-sm text-slate-300">
                                                            <span className="truncate max-w-[200px]">{link}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveLink(index)}
                                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Task Attachments (Images/Videos)</label>
                                        <div className="relative group space-y-4">
                                            <div
                                                className={`relative w-full h-40 bg-[#1a1f2e] border-2 border-dashed ${uploading ? 'border-emerald-500/50' : 'border-slate-700/50 hover:border-emerald-500/50'} rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden`}
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    multiple
                                                    onChange={async (e) => {
                                                        const files = Array.from(e.target.files);
                                                        if (!files.length) return;

                                                        setUploading(true);
                                                        const formData = new FormData();
                                                        files.forEach(file => formData.append('files', file));

                                                        try {
                                                            const { data } = await api.post('/upload', formData); // Let Axios handle Content-Type & boundary
                                                            setNewTask({ ...newTask, media: [...newTask.media, ...data.urls] });
                                                        } catch (error) {
                                                            console.error('Upload error:', error);
                                                            alert(`Upload failed: ${error.response?.data?.message || error.message}`);
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    disabled={uploading}
                                                />

                                                {uploading ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-xs text-emerald-400 font-medium">Uploading {uploading} files...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3 text-slate-500 group-hover:text-emerald-400 transition-colors">
                                                        <div className="p-4 bg-slate-800/50 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                                                            <Upload size={24} />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-medium">Click or Drag to Upload Files</p>
                                                            <p className="text-xs text-slate-600 mt-1">Images & Videos Supported</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Media Previews */}
                                            {newTask.media.length > 0 && (
                                                <div className="grid grid-cols-4 gap-4">
                                                    {newTask.media.map((url, index) => (
                                                        <div key={index} className="relative group/preview aspect-video bg-black rounded-lg overflow-hidden border border-slate-700">
                                                            {url.includes('.mp4') || url.includes('.mov') ? (
                                                                <video src={url} className="w-full h-full object-cover opacity-80" />
                                                            ) : (
                                                                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeMedia(index)}
                                                                className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover/preview:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setActiveView('dashboard')}
                                            className="px-8 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-bold border border-transparent hover:border-white/10"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-10 py-4 bg-gradient-to-r from-patronum-primary to-fuchsia-600 hover:scale-[1.02] active:scale-[0.98] rounded-2xl text-white font-black uppercase tracking-widest shadow-lg shadow-patronum-primary/25 transition-all flex items-center gap-3"
                                        >
                                            <CheckCircle size={20} />
                                            Assign Task
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )
                }

                {
                    activeView === 'history' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            <header className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Task History</h2>
                                    <p className="text-slate-400">Complete history of all tasks assigned to each team member.</p>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {users.filter(u => u.role !== 'Admin').map(user => {
                                    const userTasks = tasks.filter(t => t.assignedTo?._id === user._id);
                                    return (
                                        <div key={user._id} className="bg-patronum-card/30 backdrop-blur-md border border-patronum-border/50 rounded-[2.5rem] overflow-hidden flex flex-col h-[650px] shadow-xl relative group hover:border-patronum-primary/30 transition-all">
                                            {/* User Header */}
                                            <div className="p-8 border-b border-patronum-border/20 bg-gradient-to-b from-white/5 to-transparent sticky top-0 z-10 backdrop-blur-xl">
                                                <div className="flex items-center gap-5 mb-6">
                                                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center p-0.5 group-hover:border-patronum-primary transition-colors">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <span className="text-2xl font-black text-slate-500">{user.username.charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-white leading-tight group-hover:text-patronum-secondary transition-colors">{user.username}</h3>
                                                        <p className="text-[10px] uppercase font-black tracking-widest text-patronum-primary mt-1">{user.role}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3 text-center bg-black/20 p-4 rounded-2xl border border-white/5">
                                                    <div>
                                                        <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Total</div>
                                                        <div className="text-lg font-black text-white">{userTasks.length}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Done</div>
                                                        <div className="text-lg font-black text-emerald-400">{userTasks.filter(t => t.status === 'Completed').length}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Live</div>
                                                        <div className="text-lg font-black text-amber-400">{userTasks.filter(t => t.status !== 'Completed').length}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tasks List */}
                                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                                                {userTasks.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-30">
                                                        <ClipboardList size={48} />
                                                        <p className="text-xs font-black uppercase tracking-[0.2em]">Pristine History</p>
                                                    </div>
                                                ) : (
                                                    userTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(task => (
                                                        <div key={task._id} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.08] transition-all group/task">
                                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                                <h4 className="text-[15px] font-bold text-white line-clamp-1 flex-1 transition-colors group-hover/task:text-patronum-secondary" title={task.title}>{task.title}</h4>
                                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                    task.status === 'Submitted' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                                    }`}>
                                                                    {task.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-medium">{task.description || 'No specialized instructions provided for this project.'}</p>

                                                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 border-t border-white/5 pt-4 mt-2">
                                                                <div className="flex items-center gap-2">
                                                                    <CalendarIcon size={12} className="text-patronum-primary" />
                                                                    {new Date(task.createdAt).toLocaleDateString()}
                                                                </div>
                                                                {task.submission?.fileUrl && (
                                                                    <a href={task.submission.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-patronum-secondary hover:text-white transition-all">
                                                                        <ExternalLink size={12} /> Results
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )
                }

                {
                    activeView === 'assets' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <header className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Asset Manager</h2>
                                    <p className="text-slate-400">Manage all uploaded files and media.</p>
                                </div>
                            </header>

                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {tasks.flatMap(task => {
                                    const assets = [];
                                    if (task.assets) task.assets.forEach(url => assets.push({ url, type: 'Task File', task }));
                                    if (task.media) task.media.forEach(url => assets.push({ url, type: 'Media', task }));
                                    if (task.remarkFile) assets.push({ url: task.remarkFile, type: 'Remark File', task });
                                    if (task.submission?.fileUrl) assets.push({ url: task.submission.fileUrl, type: 'Submission', task });
                                    return assets;
                                }).filter(asset => asset.url && (asset.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || asset.url.includes('cloudinary'))).length === 0 ? (
                                    <div className="col-span-full py-24 text-center text-slate-500 bg-patronum-card/30 rounded-[2rem] border border-patronum-border/50 border-dashed backdrop-blur-xl">
                                        <ImageIcon size={64} className="mx-auto mb-6 opacity-10" />
                                        <p className="text-lg font-medium text-slate-400">No media assets found in the system.</p>
                                    </div>
                                ) : (
                                    tasks.flatMap(task => {
                                        const assets = [];
                                        if (task.assets) task.assets.forEach(url => assets.push({ url, type: 'Task File', task }));
                                        if (task.media) task.media.forEach(url => assets.push({ url, type: 'Media', task }));
                                        if (task.remarkFile) assets.push({ url: task.remarkFile, type: 'Remark File', task });
                                        if (task.submission?.fileUrl) assets.push({ url: task.submission.fileUrl, type: 'Submission', task });
                                        return assets;
                                    }).filter(asset => asset.url && (asset.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || asset.url.includes('cloudinary'))).map((asset, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative bg-[#1a1f2e]/60 backdrop-blur-md rounded-[1.5rem] overflow-hidden border border-patronum-border/30 hover:border-patronum-primary/50 transition-all shadow-xl hover:shadow-patronum-primary/10"
                                        >
                                            <div className="aspect-square relative overflow-hidden">
                                                <img src={asset.url} alt="Asset" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                                                    <div className="flex gap-2">
                                                        <a href={asset.url} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                                            <ExternalLink size={12} /> Open
                                                        </a>
                                                        <button
                                                            onClick={() => {
                                                                setConfirmModal({
                                                                    show: true,
                                                                    title: 'Delete Asset',
                                                                    message: 'Are you sure you want to delete this asset? This will affect the associated task.',
                                                                    confirmText: 'Delete Forever',
                                                                    type: 'danger',
                                                                    onConfirm: () => {
                                                                        handleGlobalAssetDelete(asset.url, asset.task._id, asset.type);
                                                                        setConfirmModal(prev => ({ ...prev, show: false }));
                                                                    }
                                                                });
                                                            }}
                                                            className="p-2 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition-all border border-red-500/30"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 border-t border-patronum-border/20">
                                                <span className="text-[10px] font-black text-patronum-primary uppercase tracking-[0.15em] mb-1 block">{asset.type}</span>
                                                <p className="text-sm font-bold text-white truncate" title={asset.task.title}>{asset.task.title}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )
                }

                {
                    activeView === 'team' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <header className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Team Members</h2>
                                    <p className="text-slate-400">Manage and view all registered editors.</p>
                                </div>
                                <div className="px-4 py-2 bg-slate-800/50 rounded-lg text-sm text-slate-300 border border-slate-700">
                                    {teamStats.length} Total Members
                                </div>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {teamStats.map((member, index) => (
                                    <motion.div
                                        key={member._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => setSelectedMember(member)}
                                        className="bg-patronum-card/40 backdrop-blur-xl border border-patronum-border/50 hover:border-patronum-primary/50 rounded-[2rem] p-8 cursor-pointer group transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-patronum-primary/20 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-patronum-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />

                                        <div className="flex flex-col items-center text-center relative z-10">
                                            <div className="w-24 h-24 rounded-full bg-slate-800 p-1 mb-6 group-hover:scale-105 transition-transform duration-500 relative">
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-patronum-primary to-fuchsia-600 animate-spin-slow opacity-20 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative w-full h-full rounded-full border-2 border-slate-700 overflow-hidden bg-slate-900 flex items-center justify-center">
                                                    {member.avatar ? (
                                                        <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-3xl font-black text-slate-500">
                                                            {member.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-white mb-1 group-hover:text-patronum-secondary transition-colors tracking-tight">{member.username}</h3>
                                            <span className="text-[10px] font-black px-4 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10 mb-6 uppercase tracking-widest">{member.role}</span>

                                            <div className="grid grid-cols-3 gap-4 w-full pt-6 border-t border-white/5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Done</div>
                                                    <div className="text-lg font-black text-emerald-400 leading-none">{member.stats?.completed || 0}</div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live</div>
                                                    <div className="text-lg font-black text-patronum-primary leading-none">{member.stats?.inProgress || 0}</div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tasks</div>
                                                    <div className="text-lg font-black text-white leading-none">{member.stats?.total || 0}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )
                }
            </main >

            {/* Member Details Modal */}
            < AnimatePresence >
                {selectedMember && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMember(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-[#1a1f2e] border border-patronum-border/50 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            {/* Accent Glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-patronum-primary via-fuchsia-500 to-patronum-secondary"></div>

                            <div className="relative h-32 bg-gradient-to-br from-patronum-primary/10 via-transparent to-fuchsia-600/5">
                                <div className="absolute top-6 right-6 flex gap-3 z-10">
                                    {!isEditingMember && (
                                        <>
                                            <button
                                                onClick={() => handleStartEdit(selectedMember)}
                                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all backdrop-blur-md border border-white/10 hover:border-white/20"
                                                title="Edit Profile"
                                            >
                                                <Edit size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMember(selectedMember._id)}
                                                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-white rounded-xl text-red-400 hover:text-white transition-all backdrop-blur-md border border-red-500/20"
                                                title="Delete Member"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => { setSelectedMember(null); setIsEditingMember(false); }}
                                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all backdrop-blur-md border border-white/10"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-8 pb-8 -mt-12 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                <div className="w-24 h-24 rounded-full bg-[#0f1218] p-1.5 mx-auto mb-4 relative group">
                                    <div className="w-full h-full rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                                        {isEditingMember && editMemberData.avatar ? (
                                            <img src={editMemberData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : selectedMember.avatar ? (
                                            <img src={selectedMember.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-slate-600">{selectedMember.username.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>

                                    {isEditingMember && (
                                        <>
                                            <label htmlFor="admin-avatar-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20 m-1.5">
                                                <Upload className="text-white" size={20} />
                                            </label>
                                            <input
                                                type="file"
                                                id="admin-avatar-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAdminAvatarUpload}
                                                disabled={uploading}
                                            />
                                        </>
                                    )}
                                </div>

                                {isEditingMember ? (
                                    <form onSubmit={handleUpdateMember} className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Username</label>
                                            <input
                                                type="text"
                                                value={editMemberData.username}
                                                onChange={(e) => setEditMemberData({ ...editMemberData, username: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Role</label>
                                            <select
                                                value={editMemberData.role}
                                                onChange={(e) => setEditMemberData({ ...editMemberData, role: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                                            >
                                                <option value="Video Editor">Video Editor</option>
                                                <option value="Graphic Designer">Graphic Designer</option>
                                                <option value="Worker">Worker</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</label>
                                            <input
                                                type="email"
                                                value={editMemberData.email}
                                                onChange={(e) => setEditMemberData({ ...editMemberData, email: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bio</label>
                                            <textarea
                                                rows="3"
                                                value={editMemberData.bio}
                                                onChange={(e) => setEditMemberData({ ...editMemberData, bio: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Skills (comma separated)</label>
                                            <input
                                                type="text"
                                                value={editMemberData.skills}
                                                onChange={(e) => setEditMemberData({ ...editMemberData, skills: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Portfolio Link</label>
                                            <input
                                                type="text"
                                                value={editMemberData.portfolioLink}
                                                onChange={(e) => setEditMemberData({ ...editMemberData, portfolioLink: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingMember(false)}
                                                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-blue-600/20"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold text-white mb-1">{selectedMember.username}</h3>
                                            <p className="text-blue-400 font-medium">{selectedMember.role}</p>
                                            <p className="text-slate-500 text-sm mt-1">{selectedMember.email}</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
                                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Tasks Completed</div>
                                                    <div className="text-2xl font-bold text-emerald-400">{selectedMember.stats?.completed || 0}</div>
                                                </div>
                                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
                                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total Assigned</div>
                                                    <div className="text-2xl font-bold text-white">{selectedMember.stats?.total || 0}</div>
                                                </div>
                                            </div>

                                            {selectedMember.bio && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">About</h4>
                                                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                                                        {selectedMember.bio}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedMember.skills && selectedMember.skills.length > 0 ? selectedMember.skills.map((skill, i) => (
                                                            <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">
                                                                {skill}
                                                            </span>
                                                        )) : <span className="text-slate-600 text-xs italic">No skills listed</span>}
                                                    </div>
                                                </div>
                                                {selectedMember.portfolioLink && (
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Portfolio</h4>
                                                        <a
                                                            href={selectedMember.portfolioLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-2 text-blue-400 hover:text-white transition-colors text-sm"
                                                        >
                                                            <LinkIcon size={16} />
                                                            View Portfolio <ExternalLink size={12} />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* Review Modal */}
            < AnimatePresence >
                {
                    reviewModal.show && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                className="bg-[#1a1f2e] border border-patronum-border/50 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative"
                            >
                                {/* Accent Glow */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-fuchsia-600"></div>

                                <div className="p-8 border-b border-patronum-border/20 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Review Submission</h3>
                                        <p className="text-xs text-slate-500 mt-1 uppercase font-black tracking-widest">Verify task results</p>
                                    </div>
                                    <button onClick={() => setReviewModal({ show: false, task: null })} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Submission Link */}
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Submitted Link</p>
                                        {reviewModal.task?.submission?.fileUrl ? (
                                            <a href={reviewModal.task.submission.fileUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline break-all text-sm flex items-center gap-2">
                                                <ExternalLink size={14} />
                                                {reviewModal.task.submission.fileUrl}
                                            </a>
                                        ) : (
                                            <p className="text-slate-500 italic text-sm">No link provided</p>
                                        )}
                                    </div>

                                    {/* Remarks Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Remarks / Feedback</label>
                                        <textarea
                                            rows="3"
                                            value={reviewRemark}
                                            onChange={(e) => setReviewRemark(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-colors placeholder-slate-600 resize-none"
                                            placeholder="Add comments about what needs to be changed..."
                                        />
                                    </div>

                                    {/* Annotated File Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Upload Annotated Design (Optional)</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={handleReviewUpload}
                                                className="hidden"
                                                id="review-upload"
                                                disabled={reviewUploading}
                                            />
                                            <label
                                                htmlFor="review-upload"
                                                className={`flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed ${reviewFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-900/30'} rounded-xl cursor-pointer transition-all`}
                                            >
                                                {reviewUploading ? (
                                                    <span className="text-xs text-slate-400 animate-pulse">Uploading...</span>
                                                ) : reviewFile ? (
                                                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={12} /> File Attached</span>
                                                ) : (
                                                    <>
                                                        <Upload size={16} className="text-slate-500" />
                                                        <span className="text-xs text-slate-400 font-medium">Click to Upload</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-800 bg-slate-900/30 flex gap-3">
                                    <button
                                        onClick={() => handleReviewSubmit('In Progress')}
                                        disabled={reviewUploading}
                                        className="flex-1 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={16} /> Request Changes
                                    </button>
                                    <button
                                        onClick={() => handleReviewSubmit('Completed')}
                                        disabled={reviewUploading}
                                        className="flex-1 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-bold hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Approve & Complete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Delete Confirmation Modal */}
            < AnimatePresence >
                {
                    deleteModal.show && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setDeleteModal({ show: false, assetUrl: null, taskId: null, fieldType: null })}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-[#0f1218] border border-slate-700/50 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
                            >
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                    <AlertTriangle size={32} />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">Delete Asset?</h3>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    Are you sure you want to permanently delete this file? This action cannot be undone.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModal({ show: false, assetUrl: null, taskId: null, fieldType: null })}
                                        className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Description Modal */}
            < AnimatePresence >
                {
                    descriptionModal.show && descriptionModal.task && (
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
                    )
                }
            </AnimatePresence >

            {/* Confirmation Modal */}
            < AnimatePresence >
                {
                    confirmModal.show && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-[#1a1f2e] border border-patronum-border/50 w-full max-w-sm rounded-[2rem] shadow-2xl p-8 overflow-hidden"
                            >
                                {/* Accent Glow */}
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r ${confirmModal.type === 'danger' ? 'from-red-500 to-orange-500' : confirmModal.type === 'warning' ? 'from-amber-500 to-yellow-500' : 'from-patronum-primary to-fuchsia-500'}`}></div>

                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmModal.type === 'danger' ? 'bg-red-500/10 text-red-500' : confirmModal.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-patronum-primary/10 text-patronum-primary'}`}>
                                    <AlertTriangle size={40} />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3 text-center">{confirmModal.title}</h3>
                                <p className="text-slate-400 text-sm mb-8 text-center leading-relaxed">
                                    {confirmModal.message}
                                </p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                        className="flex-1 py-3.5 bg-slate-800/50 hover:bg-slate-800 text-white rounded-2xl font-semibold transition-all border border-slate-700/50 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmModal.onConfirm}
                                        className={`flex-1 py-3.5 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20' : confirmModal.type === 'warning' ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20' : 'bg-patronum-primary hover:bg-purple-500 text-white shadow-purple-600/20'}`}
                                    >
                                        {confirmModal.confirmText}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

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

export default AdminDashboard;
