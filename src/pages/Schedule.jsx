import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { planAPI } from '../services/api';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    BookOpen,
    Code,
    Brain,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import './Schedule.css';

const Schedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasksByDate, setTasksByDate] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchScheduleTasks();
    }, []);

    const fetchScheduleTasks = async () => {
        try {
            setLoading(true);
            const response = await planAPI.getScheduleTasks();
            if (response.status === 200 && response.data?.data) {
                setTasksByDate(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching schedule tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateToYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getTasksForDate = (day) => {
        const dateStr = formatDateToYYYYMMDD(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        return tasksByDate[dateStr] || [];
    };

    const getTaskTypeIcon = (type) => {
        switch (type) {
            case 'Aptitude':
                return Brain;
            case 'DSA':
                return Code;
            default:
                return BookOpen;
        }
    };

    // Get calendar data
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const isToday = (day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    return (
        <DashboardLayout>
            <div className="schedule-page">
                {/* Header */}
                <div className="schedule-page-header">
                    <div>
                        <h1>Study Schedule</h1>
                        <p>Plan and track your daily preparation activities</p>
                    </div>
                    <button className="btn btn-primary">
                        <Plus size={20} />
                        Add Task
                    </button>
                </div>

                {/* Calendar Container */}
                <div className="calendar-container">
                    {/* Calendar Header */}
                    <div className="calendar-header-section">
                        <button className="month-nav-btn" onClick={() => navigateMonth(-1)}>
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="calendar-title">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button className="month-nav-btn" onClick={() => navigateMonth(1)}>
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="calendar-loading">
                            <Loader2 className="spinner" size={48} />
                            <p>Loading schedule...</p>
                        </div>
                    ) : (
                        <div className="calendar-wrapper">
                            {/* Day Names Header */}
                            <div className="calendar-days-header">
                                {dayNames.map((day) => (
                                    <div key={day} className="day-header">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="calendar-main-grid">
                                {/* Empty cells for days before month starts */}
                                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                                    <div key={`empty-${index}`} className="calendar-cell empty-cell" />
                                ))}

                                {/* Days in month */}
                                {Array.from({ length: daysInMonth }).map((_, index) => {
                                    const day = index + 1;
                                    const dayTasks = getTasksForDate(day);
                                    const hasTasks = dayTasks.length > 0;

                                    return (
                                        <div
                                            key={day}
                                            className={`calendar-cell ${isToday(day) ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}`}
                                        >
                                            <div className="cell-header">
                                                <span className="cell-date">{day}</span>
                                                {isToday(day) && <span className="today-badge">Today</span>}
                                            </div>

                                            <div className="cell-tasks">
                                                {dayTasks.slice(0, 3).map((task, idx) => {
                                                    const TaskIcon = getTaskTypeIcon(task.type);
                                                    return (
                                                        <div key={idx} className="task-badge">
                                                            <TaskIcon size={14} className="task-badge-icon" />
                                                            <span className="task-badge-text">{task.topic}</span>
                                                        </div>
                                                    );
                                                })}
                                                {dayTasks.length > 3 && (
                                                    <div className="more-tasks-badge">
                                                        +{dayTasks.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Schedule;
