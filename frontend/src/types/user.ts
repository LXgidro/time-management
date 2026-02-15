export interface UserResponse {
  _id: string;
  email: string;
  username?: string;
}

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
}

export interface BackendUser {
  _id: string;
  email: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendTimer {
  _id: string;
  projectId: string;
  description: string;
  startTime: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}
