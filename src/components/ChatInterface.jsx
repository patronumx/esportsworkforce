import { useState, useEffect, useRef } from 'react';
import { Send, User, Search, MoreVertical, Phone, Video } from 'lucide-react';
import api from '../utils/api';
import logo from '../assets/logo.png';

const ChatInterface = ({ currentUser }) => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        let interval;
        if (selectedContact) {
            fetchMessages(selectedContact._id);
            markAsRead(selectedContact._id);
            // Polling for new messages every 3 seconds
            interval = setInterval(() => {
                fetchMessages(selectedContact._id);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [selectedContact]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const fetchContacts = async () => {
        try {
            const { data } = await api.get('/chat/contacts/all');
            setContacts(data);
        } catch (error) {
            console.error('Failed to fetch contacts', error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const { data } = await api.get(`/chat/${userId}`);
            // Only update if there are new messages or first load
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const markAsRead = async (userId) => {
        try {
            await api.put(`/chat/read/${userId}`);
            // Update local badge count immediately for better UX
            setContacts(prev => prev.map(c =>
                c._id === userId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedContact) return;

        try {
            const { data } = await api.post('/chat', {
                receiverId: selectedContact._id,
                content: inputText
            });
            setMessages([...messages, data]);
            setInputText('');
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    return (
        <div className="flex h-full bg-[#0f1218] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            {/* Sidebar / Contacts List */}
            <div className="w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search people..."
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {contacts.map(contact => (
                        <div
                            key={contact._id}
                            onClick={() => setSelectedContact(contact)}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${selectedContact?._id === contact._id
                                ? 'bg-patronum-primary/20 border border-patronum-primary/30 shadow-lg shadow-patronum-primary/10'
                                : 'hover:bg-patronum-hover border border-transparent'
                                }`}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                                    {contact.avatar ? (
                                        <img src={contact.avatar} alt={contact.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="text-slate-500" size={18} />
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f1218]"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className={`font-bold text-sm truncate ${selectedContact?._id === contact._id ? 'text-white' : 'text-slate-300'}`}>
                                        {contact.username}
                                    </h3>
                                    {contact.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex justify-center">
                                            {contact.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 truncate">{contact.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-patronum-bg relative z-0">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none z-0">
                    <img src={logo} alt="Watermark" className="w-[50%] max-w-[500px] object-contain grayscale" />
                </div>
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-patronum-border flex justify-between items-center bg-patronum-bg/30 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                                    {selectedContact.avatar ? (
                                        <img src={selectedContact.avatar} alt={selectedContact.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                                            <User size={20} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{selectedContact.username}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs text-emerald-500 font-medium">Online</span>
                                    </div>
                                </div>
                            </div>
                            {/* Icons removed as per user request */}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-patronum-bg/20 relative z-10">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
                                    <div className="w-16 h-16 bg-patronum-bg/50 rounded-2xl flex items-center justify-center">
                                        <Send size={24} />
                                    </div>
                                    <p>Start a conversation with {selectedContact.username}</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
                                    return (
                                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isMe
                                                ? 'bg-patronum-primary text-white rounded-br-sm shadow-lg shadow-patronum-primary/20'
                                                : 'bg-patronum-card text-slate-200 rounded-bl-sm border border-patronum-border'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-[10px] mt-1 text-right opacity-60 ${isMe ? 'text-purple-200' : 'text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-patronum-border bg-patronum-bg/30 backdrop-blur-sm">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-patronum-bg/50 border border-patronum-border rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-patronum-primary/50 focus:bg-patronum-bg transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="p-3 bg-patronum-primary hover:bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse absolute top-1/2 right-1/2 translate-x-3 -translate-y-3"></div>
                            <User size={48} className="opacity-20" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-1">Select a Chat</h3>
                            <p className="max-w-xs mx-auto">Choose a team member from the sidebar to start communicating.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;
