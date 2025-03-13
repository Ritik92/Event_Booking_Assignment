import React, { useEffect, useState } from 'react';
import Calendar from './Calendar';
import EventForm from './EventForm';
import { Event } from '../types';
import { getEvents, getUserTimezone } from '../services/api';

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [timezone, setTimezone] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchTimezone()]);
      setLoading(false);
    };
    
    initializeApp();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchTimezone = async () => {
    try {
      const timezone = await getUserTimezone();
      setTimezone(timezone);
    } catch (error) {
      console.error('Error fetching timezone:', error);
      // Fallback to local timezone
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleEventUpdate = (updatedEvent: Event) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    setSelectedEvent(null);
    setShowForm(false);
  };

  const handleEventAdd = (newEvent: Event) => {
    setEvents([...events, newEvent]);
    setShowForm(false);
  };

  const handleEventDelete = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
    setSelectedEvent(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation/Header */}
      <nav className="bg-indigo-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white font-bold text-xl">Event Booking System</h1>
            </div>
            <div>
              <button
                onClick={() => { setSelectedEvent(null); setShowForm(true); }}
                className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Event
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Calendar 
              events={events} 
              onEventSelect={handleEventSelect} 
              onEventDrop={handleEventUpdate} 
            />
          </div>
        )}
      </div>
      
      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <EventForm 
                  event={selectedEvent} 
                  timezone={timezone}
                  onSave={selectedEvent ? handleEventUpdate : handleEventAdd} 
                  onDelete={selectedEvent?.id ? handleEventDelete : undefined}
                  onCancel={() => { setSelectedEvent(null); setShowForm(false); }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Current timezone: {timezone || 'Loading...'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;