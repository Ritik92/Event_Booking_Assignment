import React, { useRef, useEffect, useState } from 'react';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Event } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, List, Grid, Clock } from 'lucide-react';

interface CalendarProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  onEventDrop: (event: Event) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  defaultView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  timezone?: string;
  height?: string;
}

const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  onEventSelect, 
  onEventDrop, 
  onDateSelect,
  defaultView = 'timeGridWeek',
  timezone = 'local',
  height = 'auto'
}) => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarInstanceRef = useRef<FullCalendar | null>(null);
  const [currentView, setCurrentView] = useState<string>(defaultView);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Create event color mapping based on title or other properties
  const getEventColor = (event: Event) => {
    // Simple hash function to generate consistent colors based on event title
    const hash = event.title.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  useEffect(() => {
    if (calendarRef.current) {
      const calendarEl = calendarRef.current;
      
      calendarInstanceRef.current = new FullCalendar(calendarEl, {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
        initialView: defaultView,
        headerToolbar: false, // We'll create a custom header
        timeZone: timezone,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        nowIndicator: true,
        slotMinTime: '06:00:00',
        slotMaxTime: '22:00:00',
        height,
        businessHours: {
          daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
          startTime: '09:00',
          endTime: '17:00',
        },
        eventClick: (info) => {
          const eventId = parseInt(info.event.id);
          const selectedEvent = events.find(e => e.id === eventId);
          if (selectedEvent) {
            onEventSelect(selectedEvent);
          }
        },
        eventDrop: (info) => {
          const eventId = parseInt(info.event.id);
          const originalEvent = events.find(e => e.id === eventId);
          
          if (originalEvent) {
            const updatedEvent: Event = {
              ...originalEvent,
              startTime: info.event.start?.toISOString() || originalEvent.startTime,
              endTime: info.event.end?.toISOString() || originalEvent.endTime
            };
            onEventDrop(updatedEvent);
          }
        },
        dateClick: (info) => {
          // Handle date clicks for quick event creation
          if (onDateSelect) {
            const clickedDate = new Date(info.date);
            // For day view, create a 1-hour event
            const endDate = new Date(clickedDate);
            endDate.setHours(clickedDate.getHours() + 1);
            onDateSelect(clickedDate, endDate);
          }
        },
        select: (info) => {
          // Handle date range selection
          if (onDateSelect) {
            onDateSelect(info.start, info.end);
          }
        },
        eventDidMount: (info) => {
          // Add tooltip for events
          const tooltip = document.createElement('div');
          tooltip.className = 'event-tooltip';
          tooltip.innerHTML = `
            <div class="event-tooltip-title">${info.event.title}</div>
            <div class="event-tooltip-time">${new Date(info.event.start!).toLocaleTimeString()} - ${new Date(info.event.end!).toLocaleTimeString()}</div>
            ${info.event.extendedProps.location ? `<div class="event-tooltip-location">📍 ${info.event.extendedProps.location}</div>` : ''}
          `;
          
          const eventEl = info.el;
          eventEl.addEventListener('mouseover', () => {
            document.body.appendChild(tooltip);
            const rect = eventEl.getBoundingClientRect();
            tooltip.style.position = 'absolute';
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
            tooltip.style.backgroundColor = 'white';
            tooltip.style.padding = '5px 8px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            tooltip.style.zIndex = '10000';
            tooltip.style.fontSize = '12px';
          });
          
          eventEl.addEventListener('mouseout', () => {
            if (document.body.contains(tooltip)) {
              document.body.removeChild(tooltip);
            }
          });
        },
        datesSet: (info) => {
          setCurrentDate(info.view.currentStart);
          setCurrentView(info.view.type);
        }
      });

      calendarInstanceRef.current.render();
    }

    return () => {
      if (calendarInstanceRef.current) {
        calendarInstanceRef.current.destroy();
      }
    };
  }, [defaultView, timezone, height, onDateSelect]);

  useEffect(() => {
    if (calendarInstanceRef.current) {
      calendarInstanceRef.current.removeAllEvents();
      
      const fcEvents = events.map(event => ({
        id: String(event.id),
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        backgroundColor: getEventColor(event),
        borderColor: getEventColor(event),
        extendedProps: {
          description: event.description,
          location: event.location
        }
      }));
      
      calendarInstanceRef.current.addEventSource(fcEvents);
    }
  }, [events]);

  // Navigate to today
  const goToToday = () => {
    if (calendarInstanceRef.current) {
      calendarInstanceRef.current.today();
    }
  };

  // Navigate to previous time period
  const prev = () => {
    if (calendarInstanceRef.current) {
      calendarInstanceRef.current.prev();
    }
  };

  // Navigate to next time period
  const next = () => {
    if (calendarInstanceRef.current) {
      calendarInstanceRef.current.next();
    }
  };

  // Change view
  const changeView = (viewName: string) => {
    if (calendarInstanceRef.current) {
      calendarInstanceRef.current.changeView(viewName);
      setCurrentView(viewName);
    }
  };

  // Format current date range for title
  const formatDateRange = () => {
    if (!currentDate) return '';
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric',
      day: currentView !== 'dayGridMonth' ? 'numeric' : undefined
    });
    
    if (currentView === 'dayGridMonth') {
      return dateFormatter.format(currentDate);
    } else if (currentView === 'timeGridDay' || currentView === 'listDay') {
      return dateFormatter.format(currentDate);
    } else {
      // For week views, show range
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + 6);
      
      const startFormatter = new Intl.DateTimeFormat('en-US', { 
        month: 'long', 
        day: 'numeric'
      });
      
      const endFormatter = new Intl.DateTimeFormat('en-US', { 
        month: currentDate.getMonth() !== endDate.getMonth() ? 'long' : undefined,
        day: 'numeric',
        year: currentDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined
      });
      
      return `${startFormatter.format(currentDate)} - ${endFormatter.format(endDate)}, ${endDate.getFullYear()}`;
    }
  };

  return (
    <div className="calendar-container bg-white rounded-lg shadow-md overflow-hidden">
      {/* Custom toolbar */}
      <div className="calendar-toolbar p-4 flex flex-wrap justify-between items-center border-b border-gray-200">
        <div className="flex items-center mb-2 sm:mb-0">
          <button 
            onClick={prev}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={next}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 mr-2"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{formatDateRange()}</h2>
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={goToToday}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 mr-4"
          >
            Today
          </button>
          
          <div className="bg-gray-100 rounded-md flex items-stretch">
            <button 
              onClick={() => changeView('dayGridMonth')}
              className={`p-2 flex items-center text-sm ${currentView === 'dayGridMonth' ? 'bg-blue-500 text-white rounded-l-md' : 'text-gray-700'}`}
              title="Month view"
            >
              <CalendarIcon size={16} className="mr-1" />
              <span className="hidden sm:inline">Month</span>
            </button>
            <button 
              onClick={() => changeView('timeGridWeek')}
              className={`p-2 flex items-center text-sm ${currentView === 'timeGridWeek' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
              title="Week view"
            >
              <Grid size={16} className="mr-1" />
              <span className="hidden sm:inline">Week</span>
            </button>
            <button 
              onClick={() => changeView('timeGridDay')}
              className={`p-2 flex items-center text-sm ${currentView === 'timeGridDay' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
              title="Day view"
            >
              <Clock size={16} className="mr-1" />
              <span className="hidden sm:inline">Day</span>
            </button>
            <button 
              onClick={() => changeView('listWeek')}
              className={`p-2 flex items-center text-sm ${currentView === 'listWeek' ? 'bg-blue-500 text-white rounded-r-md' : 'text-gray-700'}`}
              title="List view"
            >
              <List size={16} className="mr-1" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Calendar Container */}
      <div ref={calendarRef} className="calendar p-2"></div>
      
      {/* Add custom CSS for FullCalendar enhancement */}
      <style>{`
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
        }
        
        .fc .fc-button {
          border-radius: 0.375rem;
          text-transform: capitalize;
          box-shadow: none !important;
          padding: 0.5rem 0.75rem;
        }
        
        .fc .fc-button-primary {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .fc .fc-button-primary:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        
        .fc-theme-standard .fc-list-day-cushion,
        .fc-theme-standard td, 
        .fc-theme-standard th {
          border-color: #e5e7eb;
        }
        
        .fc .fc-daygrid-day.fc-day-today {
          background-color: rgba(59, 130, 246, 0.08);
        }
        
        .fc .fc-timegrid-now-indicator-line {
          border-color: #ef4444;
        }
        
        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #ef4444;
          border-bottom-color: transparent;
          border-left-color: transparent;
        }
        
        .fc-event {
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: transform 0.1s ease-in-out;
        }
        
        .fc-event:hover {
          transform: scale(1.01);
        }
        
        .fc-event-tooltip-title {
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        /* Add responsive adjustments */
        @media (max-width: 640px) {
          .fc .fc-toolbar.fc-header-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .fc .fc-toolbar-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;