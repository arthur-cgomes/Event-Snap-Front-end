
import { User, Event, Media } from '../types';

const API_URL = 'https://event-snap-production.up.railway.app';

const getAuthToken = (): string | null => {
  try {
    return window.localStorage.getItem('authToken');
  } catch (e) {
    console.error('Failed to access localStorage', e);
    return null;
  }
};

const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body: any | null = null,
  isFormData: boolean = false
): Promise<T> => {
  const token = getAuthToken();
  const headers = new Headers();
  if (!isFormData) {
    headers.append('Content-Type', 'application/json');
  }
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Erro interno no servidor ou resposta inesperada.' };
      }
      
      const error = new Error(errorData.message || `Erro ${response.status}: Falha na comunicação com o servidor.`) as any;
      error.status = response.status;
      throw error;
    }

    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return null as T;
    }

    return await response.json();
  } catch (error: any) {
    if (error.message === 'Failed to fetch' || error instanceof TypeError) {
      throw new Error('Sistema temporariamente indisponível');
    }
    throw error;
  }
};


// --- AUTH SERVICE ---
interface LoginResponse {
  token: string;
  userId: string;
  name: string;
  userType: string;
  expiresIn: number;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  email?: string;
}

export const authService = {
  requestSignup: async (email: string): Promise<void> => {
    await apiRequest<any>('/auth/request-signup', 'POST', { email });
  },

  confirmSignup: async (data: any): Promise<void> => {
    await apiRequest<any>('/auth/confirm-signup', 'POST', data);
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/login', 'POST', { email, password });
  },

  requestReset: async (email: string): Promise<void> => {
    await apiRequest<any>('/auth/request-reset', 'POST', { email });
  },

  confirmReset: async (data: { email: string; newPassword: any; code: string; }): Promise<void> => {
    await apiRequest<any>('/auth/confirm-reset', 'POST', data);
  },

  getUserProfile: async (userId: string): Promise<User> => {
    return apiRequest<User>(`/user/${userId}`, 'GET');
  },

  updateUser: async (userId: string, data: UpdateUserDto): Promise<User> => {
    return apiRequest<User>(`/user/${userId}/update`, 'PATCH', data);
  },

  forceResetPassword: async (userId: string, password: any): Promise<void> => {
    await apiRequest<void>(`/auth/admin/force-reset/${userId}`, 'POST', { password });
  }
};

// --- EVENT SERVICE ---
const mapApiEventToEvent = (apiEvent: any): Event => ({
  id: apiEvent.id,
  name: apiEvent.eventName,
  token: apiEvent.token || apiEvent.id,
  description: apiEvent.descriptionEvent,
  createdAt: new Date(apiEvent.createdAt),
  expiresAt: new Date(apiEvent.expirationDate),
  userId: apiEvent.user?.id || apiEvent.userId || '',
  medias: apiEvent.medias || [],
  eventColor: apiEvent.eventColor,
});

export const eventService = {
  getEventsForUser: async (userId: string): Promise<Event[]> => {
    const endpoint = `/qrcode?take=50&skip=0&sort=eventName&order=ASC&userId=${userId}`;
    const response = await apiRequest<{ items: any[] }>(endpoint, 'GET');
    return (response.items || []).map(mapApiEventToEvent);
  },

  getEventById: async (eventId: string): Promise<Event | null> => {
    try {
      const event = await apiRequest<any>(`/qrcode/${eventId}`, 'GET');
      return mapApiEventToEvent(event);
    } catch (error) {
      console.error("Event not found", error);
      return null;
    }
  },

  getMediaForEvent: async (eventToken: string, userId: string): Promise<string[]> => {
    if (!eventToken || eventToken === 'undefined') {
      return [];
    }
    const endpoint = `/upload/${eventToken}?userId=${userId}`;
    try {
      return await apiRequest<string[]>(endpoint, 'GET');
    } catch (error) {
      console.error("Error in getMediaForEvent:", error);
      throw error;
    }
  },

  createEvent: async (userId: string, name: string, expiresAt: Date, description?: string, eventColor?: string): Promise<Event> => {
    const payload = {
      userId,
      expirationDate: expiresAt.toISOString(),
      eventName: name,
      descriptionEvent: description || null,
      eventColor: eventColor || null,
      type: 'PAID'
    };
    const event = await apiRequest<any>('/qrcode', 'POST', payload);
    return mapApiEventToEvent(event);
  },

  addMediaToEvent: async (eventToken: string, file: File): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<any>(`/upload/${eventToken}`, 'POST', formData, true);
  },

  deleteMedia: async (urls: string[]): Promise<void> => {
    await apiRequest<void>('/upload', 'DELETE', { urls });
  },

  updateEvent: async (eventId: string, payload: { eventName?: string; descriptionEvent?: string; expirationDate?: string; eventColor?: string; }): Promise<Event | null> => {
    const event = await apiRequest<any>(`/qrcode/${eventId}`, 'PATCH', payload);
    return mapApiEventToEvent(event);
  },
};

// --- ADMIN SERVICE ---
export interface AdminDashboardData {
  usersCreated: number;
  usersLoggedIn: number;
  usersInactive: number;
  qrcodeActive: number;
  qrcodeExpired: number;
  qrcodeNone: number;
  window: {
    from: string;
    to: string;
    tz: string;
  };
}

export interface AdminUserData {
  id: string;
  createdAt?: string;
  name: string;
  phone: string;
  email: string;
  lastLogin: string | null;
  userType?: string;
}

export interface AdminQRCodeData {
  id: string;
  createdAt: string;
  eventName: string;
  expirationDate: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
  }
}

export interface PaginatedUsersResponse {
  total: number;
  items: AdminUserData[];
}

export interface PaginatedQRCodesResponse {
  total: number;
  items: AdminQRCodeData[];
}

export const adminService = {
  getDashboardData: async (start: string, end: string): Promise<AdminDashboardData> => {
    const endpoint = `/user/admin/dash?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`;
    return apiRequest<AdminDashboardData>(endpoint, 'GET');
  },

  getAllUsers: async (take: number = 10, skip: number = 0, sort: string = 'name', order: 'ASC' | 'DESC' = 'ASC'): Promise<PaginatedUsersResponse> => {
    const endpoint = `/user?take=${take}&skip=${skip}&sort=${sort}&order=${order}`;
    return apiRequest<PaginatedUsersResponse>(endpoint, 'GET');
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiRequest<void>(`/user/${userId}`, 'DELETE');
  },

  getCreatedUsers: async (take: number = 10, skip: number = 0): Promise<PaginatedUsersResponse> => {
    const endpoint = `/user/admin/dash/created-users?take=${take}&skip=${skip}&sort=name&order=ASC`;
    return apiRequest<PaginatedUsersResponse>(endpoint, 'GET');
  },

  getActiveUsers: async (take: number = 10, skip: number = 0): Promise<PaginatedUsersResponse> => {
    const endpoint = `/user/admin/dash/status-users?take=${take}&skip=${skip}&status=active&sort=name&order=ASC`;
    return apiRequest<PaginatedUsersResponse>(endpoint, 'GET');
  },

  getInactiveUsers: async (take: number = 10, skip: number = 0): Promise<PaginatedUsersResponse> => {
    const endpoint = `/user/admin/dash/status-users?take=${take}&skip=${skip}&status=inactive&sort=name&order=ASC`;
    return apiRequest<PaginatedUsersResponse>(endpoint, 'GET');
  },

  getQRCodesByStatus: async (status: 'active' | 'inactive', take: number = 10, skip: number = 0): Promise<PaginatedQRCodesResponse> => {
    const endpoint = `/qrcode/admin/by-status?take=${take}&skip=${skip}&status=${status}&sort=createdAt&order=ASC`;
    return apiRequest<PaginatedQRCodesResponse>(endpoint, 'GET');
  },

  getUsersWithoutQRCodes: async (take: number = 10, skip: number = 0): Promise<PaginatedUsersResponse> => {
    const endpoint = `/user/admin/dash/without-qrcodes?take=${take}&skip=${skip}&sort=name&order=ASC`;
    return apiRequest<PaginatedUsersResponse>(endpoint, 'GET');
  }
};
