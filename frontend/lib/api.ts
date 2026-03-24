const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Checks if the application is currently running in mock data mode.
 * Defaults to true if nothing is stored in localStorage.
 */
export const isMockMode = (): boolean => {
    if (typeof window === 'undefined') return true; // SSR safe

    const mockStatus = localStorage.getItem('useMockData');
    // If not set, default to true for development safety
    if (mockStatus === null) {
        localStorage.setItem('useMockData', 'true');
        return true;
    }

    return mockStatus === 'true';
};

/**
 * Toggles the mock mode state in localStorage and reloads the page.
 */
export const toggleMockMode = (mode: boolean) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('useMockData', mode.toString());
        window.location.reload();
    }
};

interface FetchOptions extends RequestInit {
    requireAuth?: boolean;
}

/**
 * Global fetch wrapper that automatically handles the mock toggle
 * and injects JWT authorization headers for the live backend.
 */
export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
    // 1. Intercept if in Mock Mode
    if (isMockMode()) {
        return {
            isMock: true,
            data: null // The caller should detect `isMock` and return local static data
        };
    }

    // 2. We are in Live Mode. Prepare headers.
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // 3. Inject Authorization Header if required
    if (options.requireAuth !== false && typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // 4. Execute Native Fetch
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // 5. Handle Global Errors (like 401 Unauthorized)
        if (response.status === 401 && typeof window !== 'undefined') {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return {
            isMock: false,
            data
        };
    } catch (error) {
        console.error(`[API Fetch Error] ${endpoint}:`, error);
        throw error;
    }
}
