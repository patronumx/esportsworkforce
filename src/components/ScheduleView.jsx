import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ScheduleView = ({ tasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);

    useEffect(() => {
        generateCalendar(currentDate);
    }, [currentDate]);

    const generateCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const daysInMonth = lastDayOfMonth.getDate();
        const startDay = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)

        // Adjust for Monday start
        let startingSlot = startDay === 0 ? 6 : startDay - 1; // 0=Mon, 6=Sun

        const days = [];

        // Previous month padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = 0; i < startingSlot; i++) {
            days.push({
                day: prevMonthLastDay - startingSlot + 1 + i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthLastDay - startingSlot + 1 + i)
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            });
        }

        // Next month padding
        const totalSlots = Math.ceil(days.length / 7) * 7;
        const remainingSlots = totalSlots - days.length;

        for (let i = 1; i <= remainingSlots; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        setCalendarDays(days);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const isSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const getMonthYearLabel = () => {
        const month = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();
        return `${month} ${year}`;
    };

    // Weekday headers starting from Monday
    const weekDayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-sans">
            {/* Header - Transparent Glass with Glow */}
            <div className="relative px-8 py-6 flex items-center justify-between z-10 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <div className="flex flex-col">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 capitalize drop-shadow-sm">
                        {getMonthYearLabel()}
                    </h2>
                    <p className="text-slate-400 text-xs font-medium tracking-wide mt-1">Overview of your deadlines</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white text-xs font-semibold transition-all"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Headers */}
                <div className="grid grid-cols-7 border-b border-white/5 bg-white/5 shrink-0">
                    {weekDayHeaders.map(day => (
                        <div key={day} className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center opacity-80">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Scroll Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-7 auto-rows-[minmax(80px,1fr)] divide-x divide-white/5 bg-transparent min-h-full">
                        {calendarDays.map((dayObj, index) => {
                            // Find tasks for this day
                            const dayTasks = tasks.filter(task => isSameDay(new Date(task.deadline), dayObj.date));
                            const isToday = isSameDay(new Date(), dayObj.date);

                            return (
                                <div
                                    key={index}
                                    className={`p-2 flex flex-col border-b border-white/5 transition-all hover:bg-white/5 group relative ${dayObj.isCurrentMonth ? 'bg-transparent' : 'bg-black/20'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1 shrink-0">
                                        <span
                                            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all ${isToday
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20 scale-105'
                                                    : dayObj.isCurrentMonth
                                                        ? 'text-slate-300 group-hover:text-white'
                                                        : 'text-slate-600'
                                                }`}
                                        >
                                            {dayObj.day}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        {dayTasks.map(task => {
                                            // Modern dark-theme colors (Neon/Cyberpunk vibe)
                                            const colors = [
                                                'bg-blue-500/20 text-blue-300 border-blue-500/30',
                                                'bg-purple-500/20 text-purple-300 border-purple-500/30',
                                                'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                                                'bg-orange-500/20 text-orange-300 border-orange-500/30',
                                                'bg-pink-500/20 text-pink-300 border-pink-500/30'
                                            ];
                                            const colorClass = colors[task._id.charCodeAt(task._id.length - 1) % colors.length];

                                            return (
                                                <div
                                                    key={task._id}
                                                    className={`text-[9px] font-medium px-2 py-1 rounded-md truncate cursor-pointer hover:brightness-125 transition-all border ${colorClass}`}
                                                    title={task.title}
                                                >
                                                    {task.title}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleView;
