
export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'user' | 'admin' | 'global';
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  uploadedAt: Date;
}

export interface Event {
  id: string;
  name: string;
  token: string;
  description?: string;
  createdAt: Date;
  userId: string;
  medias: Media[];
  expiresAt: Date;
}
