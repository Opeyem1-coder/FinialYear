const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
    requireAuth?: boolean;
}

/**
 * Global fetch wrapper that injects JWT authorization headers for the live backend.
 */
export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (options.requireAuth !== false && typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            window.location.href = '/auth/login';
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return { isMock: false, data };
    } catch (error) {
        console.error(`[API Fetch Error] ${endpoint}:`, error);
        throw error;
    }
}
