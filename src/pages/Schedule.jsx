import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { planAPI } from '../services/api';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    Target,
    BookOpen,
    Code,
    Brain,
    Loader2
} from 'lucide-react';
import './Schedule.css';

const Schedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
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

    const getSelectedDateTasks = () => {
        if (!selectedDate) return [];
        return getTasksForDate(selectedDate);
    };

    const getTaskTypeColor = (type) => {
        const colors = {
            'Aptitude': 'bg-purple-500',
            'DSA': 'bg-blue-500',
        };
        return colors[type] || 'bg-green-500';
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

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const isToday = (day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const handleDateClick = (day) => {
        setSelectedDate(day);
    };

    return (
        <DashboardLayout>
            <div className="schedule-container">
                <div className="schedule-header">
                    <div>
                        <h1>Study Schedule</h1>
                        <p>Plan and track your daily preparation activities</p>
                    </div>
                    <button className="btn btn-primary">
                        <Plus size={20} />
                        Add Task
                    </button>
                </div>

                <div className="schedule-content">
                    {/* Calendar Section */}
                    <div className="calendar-section">
                        <div className="calendar-card">
                            <div className="calendar-header">
                                <h2>
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h2>
                                <div className="calendar-nav">
                                    <button
                                        className="nav-btn"
                                        onClick={() => navigateMonth(-1)}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        className="nav-btn"
                                        onClick={() => navigateMonth(1)}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="calendar-grid">
                                {/* Day names */}
                                {dayNames.map((day) => (
                                    <div key={day} className="day-name">
                                        {day}
                                    </div>
                                ))}

                                {/* Empty cells for days before month starts */}
                                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                                    <div key={`empty-${index}`} className="calendar-day empty" />
                                ))}

                                {/* Days in month */}
                                {Array.from({ length: daysInMonth }).map((_, index) => {
                                    const day = index + 1;
                                    const dayTasks = getTasksForDate(day);
                                    const hasTasks = dayTasks.length > 0;

                                    return (
                                        <div
                                            key={day}
                                            className={`calendar-day ${isToday(day) ? 'today' : ''} ${selectedDate === day ? 'selected' : ''
                                                } ${hasTasks ? 'has-tasks' : ''}`}
                                            onClick={() => handleDateClick(day)}
                                        >
                                            <span className="day-number">{day}</span>
                                            {hasTasks && (
                                                <div className="day-indicators">
                                                    {dayTasks.slice(0, 3).map((task, idx) => {
                                                        const TaskIcon = getTaskTypeIcon(task.type);
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`task-indicator ${getTaskTypeColor(task.type)}`}
                                                                title={task.topic}
                                                            />
                                                        );
                                                    })}
                                                    {dayTasks.length > 3 && (
                                                        <span className="more-indicator">+{dayTasks.length - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar for selected day details */}
                    <div className="schedule-sidebar">
                        {selectedDate ? (
                            <>
                                <div className="sidebar-header">
                                    <div className="selected-date">
                                        <CalendarIcon size={24} className="text-purple-400" />
                                        <div>
                                            <h3>
                                                {monthNames[currentDate.getMonth()]} {selectedDate}
                                            </h3>
                                            <p className="text-slate-400">
                                                {dayNames[new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).getDay()]}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="tasks-container">
                                    <h4>Tasks for this day</h4>
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-purple-500" />
                                            <p className="text-slate-400">Loading tasks...</p>
                                        </div>
                                    ) : getSelectedDateTasks().length > 0 ? (
                                        <div className="tasks-list">
                                            {getSelectedDateTasks().map((task, idx) => {
                                                const TaskIcon = getTaskTypeIcon(task.type);
                                                return (
                                                    <div key={idx} className="task-item">
                                                        <div className={`task-icon ${getTaskTypeColor(task.type)}`}>
                                                            <TaskIcon size={18} />
                                                        </div>
                                                        <div className="task-details">
                                                            <h5>{task.topic}</h5>
                                                            <div className="task-meta">
                                                                <span className="task-type">{task.type}</span>
                                                                <span className="separator">•</span>
                                                                <span className="task-plan">{task.planSubject}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="empty-tasks">
                                            <Target size={48} className="empty-icon" />
                                            <p>No tasks scheduled</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="no-date-selected">
                                <CalendarIcon size={64} className="empty-icon" />
                                <h3>Select a date</h3>
                                <p>Click on a date in the calendar to view or add tasks</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Schedule;
