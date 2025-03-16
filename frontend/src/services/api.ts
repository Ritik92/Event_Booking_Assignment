import { Event } from '../types';

const API_URL = 'https://event-booking-backend-production.up.railway.app/api/events';

export const getEvents = async (): Promise<Event[]> => {
  const response = await fetch(API_URL);
  return response.json();
};

export const getUserEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${API_URL}/user`);
  return response.json();
};

export const getUserTimezone = async (): Promise<string> => {
  const response = await fetch(`${API_URL}/timezone`);
  const data = await response.json();
  return data.timezone;
};

export const createEvent = async (event: Event): Promise<Event> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
  return response.json();
};

export const updateEvent = async (id: number, event: Event): Promise<Event> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
  return response.json();
};

export const deleteEvent = async (id: number): Promise<void> => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};