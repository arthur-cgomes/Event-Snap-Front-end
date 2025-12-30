
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useEvents = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an AppProvider');
  }
  const { events, loadingEvents, createEvent, getEventById, addMediaToEvent, updateEvent, getMediaForEvent, deleteMedia } = context;
  return { events, loadingEvents, createEvent, getEventById, addMediaToEvent, updateEvent, getMediaForEvent, deleteMedia };
};
