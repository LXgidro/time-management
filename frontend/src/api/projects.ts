import { httpClient } from './httpClient';
import type { Project } from '../types/appstore';
export type { Project };

export async function getProjectsApi() {
  try {
    const { data } = await httpClient.get<Project[]>('/projects');
    return data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
}

export async function createProjectApi(payload: {
  name: string;
  description?: string;
  color?: string;
}) {
  try {
    const { data } = await httpClient.post<Project>('/projects', payload);
    return data;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
}

export async function updateProjectApi(
  id: string,
  payload: Partial<Pick<Project, 'name' | 'description' | 'color'>>,
) {
  try {
    const { data } = await httpClient.patch<Project>(
      `/projects/${id}`,
      payload,
    );
    return data;
  } catch (error) {
    console.error(`Failed to update project ${id}:`, error);
    throw error;
  }
}

export async function deleteProjectApi(id: string) {
  try {
    const { data } = await httpClient.delete<{ message: string }>(
      `/projects/${id}`,
    );
    return data;
  } catch (error) {
    console.error(` Failed to delete project ${id}:`, error);
    throw error;
  }
}
