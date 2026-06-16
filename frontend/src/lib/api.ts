const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(method: string, path: string, body?: any) {
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  get(path: string) {
    return this.request('GET', path);
  }

  post(path: string, body?: any) {
    return this.request('POST', path, body);
  }

  put(path: string, body?: any) {
    return this.request('PUT', path, body);
  }

  delete(path: string) {
    return this.request('DELETE', path);
  }
}

export const api = new ApiClient(API_BASE);
