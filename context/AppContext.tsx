
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, Event } from '../types';
import { authService, eventService } from '../services/mockApi';

interface AppContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  events: Event[];
  loadingEvents: boolean;
  createEvent: (name: string, expiresAt: Date, description?: string) => Promise<Event | null>;
  getEventById: (id: string) => Promise<Event | null>;
  addMediaToEvent: (eventId: string, file: File) => Promise<void>;
  updateEvent: (eventId: string, data: { name?: string; description?: string; expiresAt?: Date; }) => Promise<void>;
  getMediaForEvent: (eventToken: string, userId: string) => Promise<string[]>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);

  const fetchEvents = useCallback(async () => {
    if (user) {
      setLoadingEvents(true);
      try {
        const userEvents = await eventService.getEventsForUser(user.id);
        setEvents(userEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        console.error("Failed to fetch events", error);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const checkUserSession = () => {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            try {
                const currentUser = JSON.parse(storedUser);
                setUser(currentUser);
            } catch (error) {
                console.error("Failed to parse user from localStorage, logging out.", error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setUser(null);
            }
        }
        setLoading(false);
    };
    checkUserSession();
  }, []);

  useEffect(() => {
    if (user && user.userType === 'user') {
      fetchEvents();
    } else {
      setEvents([]);
    }
  }, [user, fetchEvents]);

  const login = async (email: string, pass: string) => {
    const loginResponse = await authService.login(email, pass);
    localStorage.setItem('authToken', loginResponse.token);
    const loggedInUser: User = {
        id: loginResponse.userId,
        name: loginResponse.name,
        email: email,
        userType: loginResponse.userType as User['userType'],
    };
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const createEvent = async (name: string, expiresAt: Date, description?: string): Promise<Event | null> => {
    if (!user) return null;
    try {
      const newEvent = await eventService.createEvent(user.id, name, expiresAt, description);
      setEvents(prevEvents => [newEvent, ...prevEvents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      return newEvent;
    } catch (error) {
      console.error("Failed to create event", error);
      return null;
    }
  };
  
  const getEventById = async (id: string): Promise<Event | null> => {
    return eventService.getEventById(id);
  };

  const addMediaToEvent = async (eventId: string, file: File) => {
     try {
       await eventService.addMediaToEvent(eventId, file);
     } catch (error) {
       console.error("Failed to add media", error);
       throw error;
     }
  };

  const updateEvent = async (eventId: string, data: { name?: string; description?: string; expiresAt?: Date; }) => {
    if (!user) return;
    try {
      const payload: { eventName?: string; descriptionEvent?: string; expirationDate?: string; } = {};
      if (data.name !== undefined) {
        payload.eventName = data.name;
      }
      if (data.description !== undefined) {
        payload.descriptionEvent = data.description;
      }
      if (data.expiresAt) {
        payload.expirationDate = data.expiresAt.toISOString();
      }

      if (Object.keys(payload).length === 0) {
        return; 
      }

      const updatedEvent = await eventService.updateEvent(eventId, payload);
      if (updatedEvent) {
        setEvents(prevEvents => 
          prevEvents.map(event => event.id === eventId ? updatedEvent : event)
        );
      }
    } catch (error) {
      console.error("Failed to update event", error);
      throw error;
    }
  };

  const getMediaForEvent = async (eventToken: string, userId: string): Promise<string[]> => {
    try {
      return await eventService.getMediaForEvent(eventToken, userId);
    } catch (error) {
      console.error("Failed to fetch media for event", error);
      return []; // Return empty array on failure
    }
  };


  return (
    <AppContext.Provider value={{ user, loading, login, logout, events, loadingEvents, createEvent, getEventById, addMediaToEvent, updateEvent, getMediaForEvent }}>
      {children}
    </AppContext.Provider>
  );
};
