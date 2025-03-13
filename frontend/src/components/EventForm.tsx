import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { createEvent, updateEvent, deleteEvent } from '../services/api';
import { Calendar, Clock, MapPin, Type, AlignLeft, Save, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast'; 

interface EventFormProps {
  event: Event | null;
  timezone: string;
  onSave: (event: Event) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ 
  event, timezone, onSave, onDelete, onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    timeRange?: string;
  }>({});

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartTime(new Date(event.startTime).toISOString().slice(0, 16));
      setEndTime(new Date(event.endTime).toISOString().slice(0, 16));
      setLocation(event.location || '');
    } else {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setStartTime(now.toISOString().slice(0, 16));
      setEndTime(oneHourLater.toISOString().slice(0, 16));
    }
  }, [event]);

  const validateForm = () => {
    const newErrors: {
      title?: string;
      timeRange?: string;
    } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (new Date(startTime) >= new Date(endTime)) {
      newErrors.timeRange = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Create loading toast that will be dismissed on success/error
    const loadingToastId = toast.loading('Saving event...');
    
    try {
      const eventData: Event = {
        ...event,
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        location,
        timezone
      };
      
      let savedEvent;
      
      if (event?.id) {
        savedEvent = await updateEvent(event.id, eventData);
        toast.success('Event updated successfully', { id: loadingToastId });
      } else {
        savedEvent = await createEvent(eventData);
        toast.success('Event created successfully', { id: loadingToastId });
      }
      
      onSave(savedEvent);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event. Please try again.', { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !onDelete) return;
    
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!event?.id || !onDelete) return;
    
    setIsSubmitting(true);
    setShowConfirmModal(false);
    
    // Create loading toast
    const loadingToastId = toast.loading('Deleting event...');
    
    try {
      await deleteEvent(event.id);
      onDelete(event.id);
      toast.success('Event deleted successfully', { id: loadingToastId });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event. Please try again.', { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {event ? 'Edit Event' : 'Create Event'}
        </h2>
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label htmlFor="title" className="flex items-center text-sm font-medium text-gray-700">
            <Type size={18} className="mr-2" />
            <span>Title</span>
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="title"
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add event title"
            required
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title}</p>
          )}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700">
            <AlignLeft size={18} className="mr-2" />
            <span>Description</span>
          </label>
          <textarea
            id="description"
            className="w-full px-4 py-2 border border-gray-300 rounded-md h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description or notes"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="startTime" className="flex items-center text-sm font-medium text-gray-700">
              <Calendar size={18} className="mr-2" />
              <Clock size={18} className="mr-2" />
              <span>Start Time</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="datetime-local"
              id="startTime"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.timeRange ? 'border-red-500' : 'border-gray-300'
              }`}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="endTime" className="flex items-center text-sm font-medium text-gray-700">
              <Calendar size={18} className="mr-2" />
              <Clock size={18} className="mr-2" />
              <span>End Time</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="datetime-local"
              id="endTime"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.timeRange ? 'border-red-500' : 'border-gray-300'
              }`}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        {errors.timeRange && (
          <p className="text-sm text-red-500 mt-1">{errors.timeRange}</p>
        )}
        
        <div className="space-y-1">
          <label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700">
            <MapPin size={18} className="mr-2" />
            <span>Location</span>
          </label>
          <input
            type="text"
            id="location"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add location"
          />
        </div>
        
        <div className="bg-gray-50 rounded-md p-3 flex items-center">
          <Calendar size={20} className="mr-2 text-gray-600" />
          <span className="text-sm text-gray-600">
            Timezone: <span className="font-medium">{timezone}</span>
          </span>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          {onDelete && event?.id && (
            <button
              type="button"
              className="flex items-center px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              <Trash2 size={18} className="mr-1" />
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          
          <button 
            type="submit" 
            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            <Save size={18} className="mr-1" />
            {isSubmitting ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </form>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Event</h3>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventForm;