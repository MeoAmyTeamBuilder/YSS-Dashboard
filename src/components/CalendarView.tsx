import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CalendarKvk } from '../types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Star, Calendar as CalendarIcon, X, Clock, AlignLeft } from 'lucide-react';

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarKvk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarKvk | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

      const start = format(startDate, 'yyyy-MM-dd');
      const end = format(endDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('CalendarKvk')
        .select('*')
        .gte('activeDate', start)
        .lte('activeDate', end);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = [
    { short: 'Mon', long: 'Mon' },
    { short: 'Tue', long: 'Tue' },
    { short: 'Wed', long: 'Wed' },
    { short: 'Thu', long: 'Thu' },
    { short: 'Fri', long: 'Fri' },
    { short: 'Sat', long: 'Sat' },
    { short: 'Sun', long: 'Sun' }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 shrink-0 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] shrink-0">
            <CalendarIcon className="text-blue-400" size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-baseline gap-2">
            {format(currentDate, 'MMMM')}
            <span className="text-base sm:text-lg font-medium text-slate-400">{format(currentDate, 'yyyy')}</span>
          </h2>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-px bg-white/10 shrink-0 border-b border-white/10">
            {weekDays.map((day, i) => (
              <div key={i} className="bg-slate-900/80 py-2 sm:py-3 text-center text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                <span className="sm:hidden">{day.short.charAt(0)}</span>
                <span className="hidden sm:inline">{day.long}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div 
            className="flex-1 grid grid-cols-7 gap-px bg-white/10 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide"
            style={{ gridAutoRows: 'minmax(80px, 1fr)' }}
          >
            {days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayEvents = events.filter(e => e.activeDate === dateStr);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  className={`bg-slate-900/50 p-1 sm:p-2 transition-colors overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col ${
                    !isCurrentMonth ? 'opacity-40' : 'hover:bg-white/5'
                  } ${isTodayDate ? 'ring-1 ring-inset ring-blue-500 bg-blue-500/5' : ''}`}
                >
                  <div className="flex justify-center sm:justify-start items-start mb-1 sm:mb-2 shrink-0">
                    <span className={`text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${
                      isTodayDate 
                        ? 'bg-blue-500 text-white' 
                        : isCurrentMonth ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {format(day, dateFormat)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    {dayEvents.map((event, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedEvent(event)}
                        className={`text-left flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity w-full ${
                          event.importantDate === 1 
                            ? 'text-amber-400 font-bold' 
                            : 'text-blue-300 font-medium'
                        }`}
                      >
                        {event.importantDate === 1 && <Star size={8} className="fill-amber-400 flex-shrink-0 hidden sm:block" />}
                        <span className="truncate text-[9px] sm:text-xs leading-tight" title={event.nameDate}>{event.nameDate}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold ${
                selectedEvent.importantDate === 1 ? 'text-amber-400' : 'text-blue-400'
              }`}>
                {selectedEvent.nameDate}
              </h3>
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock size={16} className="text-slate-500" />
                <span>{selectedEvent.timeDate}</span>
              </div>
              
              {selectedEvent.desDate && (
                <div className="flex items-start gap-2 text-slate-300">
                  <AlignLeft size={16} className="text-slate-500 mt-1 shrink-0" />
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedEvent.desDate}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
