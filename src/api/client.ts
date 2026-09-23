/**
 * MSRF API Client Abstraction
 * Configured for seamless future connection to Django REST Framework endpoints.
 * Endpoints e.g., /api/v1/students/, /api/v1/coaches/, /api/v1/payments/
 */

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class ApiClient {
  private baseUrl = '/api/v1';

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('msrf_auth_token') || 'demo-jwt-token-xyz';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async get<T>(_endpoint: string): Promise<ApiResponse<T>> {
    // In production, this would be `fetch(${this.baseUrl}${_endpoint})`
    return { data: {} as T, status: 200 };
  }

  async post<T>(_endpoint: string, _payload: any): Promise<ApiResponse<T>> {
    return { data: {} as T, status: 201 };
  }

  async put<T>(_endpoint: string, _payload: any): Promise<ApiResponse<T>> {
    return { data: {} as T, status: 200 };
  }

  async delete<T>(_endpoint: string): Promise<ApiResponse<T>> {
    return { data: {} as T, status: 204 };
  }
}

export const apiClient = new ApiClient();
