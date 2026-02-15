import { httpClient } from './httpClient';
import type { UserResponse, AuthUser } from '../types/user';

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function loginApi(payload: { email: string; password: string }) {
  try {
    const { data } = await httpClient.post<AuthResponse>(
      '/auth/login',
      payload,
    );
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function registerApi(payload: {
  email: string;
  username: string;
  password: string;
}) {
  try {
    const { data } = await httpClient.post<AuthResponse>(
      '/auth/register',
      payload,
    );
    return data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

export async function meApi() {
  try {
    const { data } = await httpClient.get<UserResponse>('/auth/me');
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

export async function updateProfileApi(payload: {
  email?: string;
  username?: string;
}) {
  try {
    const { data } = await httpClient.patch<UserResponse>(
      '/auth/profile',
      payload,
    );
    return data;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}

export async function updatePasswordApi(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const { data } = await httpClient.patch<{ message: string }>(
      '/auth/password',
      payload,
    );
    return data;
  } catch (error) {
    console.error('Failed to update password:', error);
    throw error;
  }
}
