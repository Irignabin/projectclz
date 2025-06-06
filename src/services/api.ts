import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Types
export interface User {
    id: number;
    name: string;
    email: string;
    blood_type: string;
    phone: string;
    address: string;
    is_donor: boolean;
    available_to_donate: boolean;
    latitude: number;
    longitude: number;
    last_donation_date?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    blood_type: string;
    is_donor: boolean;
    address: string;
    latitude: number;
    longitude: number;
}

export interface ProfileUpdateData {
    name?: string;
    blood_type?: string;
    phone?: string;
    address?: string;
    is_donor?: boolean;
    available_to_donate?: boolean;
}

export interface DonorFormData {
    name: string;
    phone: string;
    blood_type: string;
    address: string;
    date_of_birth: string;
    weight: string;
    height: string;
    last_donation: string;
    medical_conditions: string[];
    medications: string;
    agreement: boolean;
    health_status: string;
}

export interface LocationData {
    latitude: number;
    longitude: number;
    radius?: number;
}

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface BloodRequestData {
    blood_type: string;
    units_needed: number;
    hospital_name: string;
    hospital_address: string;
    latitude: number;
    longitude: number;
    urgency_level: UrgencyLevel;
    patient_name: string;
    contact_phone: string;
    additional_notes?: string;
}

export interface Donor extends User {
    blood_type: string;
    last_donation_date?: string;
    is_available: boolean;
}

export interface Hospital {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    contact_phone: string;
}

export interface BloodBank {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    contact_phone: string;
    available_blood_types: string[];
}

export interface BloodRequest {
    id: number;
    blood_type: string;
    units_needed: number;
    urgency_level: UrgencyLevel;
    hospital_name: string;
    latitude: number;
    longitude: number;
    contact_person: string;
    contact_phone: string;
    status: 'pending' | 'fulfilled' | 'cancelled';
    created_at: string;
}

// Auth Services
export const authService = {
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await api.post('/login', data);
        return response.data as AuthResponse;
    },
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post('/register', data);
        return response.data as AuthResponse;
    },
    logout: async (): Promise<void> => {
        await api.post('/logout');
    }
};

// User Services
export const userService = {
    getProfile: async (): Promise<User> => {
        const response = await api.get('/user');
        return response.data as User;
    },
    updateProfile: async (data: ProfileUpdateData): Promise<User> => {
        const response = await api.put('/user/profile', data);
        return response.data as User;
    },
    updateLocation: async (data: { latitude: number; longitude: number; address: string }): Promise<User> => {
        const response = await api.put('/user/location', data);
        return response.data as User;
    }
};

// Donor Services
export const donorService = {
    becomeDonor: async (data: DonorFormData) => {
        const response = await api.post('/donors', data);
        return response.data;
    },
    getNearbyDonors: async (params: LocationData) => {
        const response = await api.get('/donors/nearby', { params });
        return response.data;
    },
    updateAvailability: async (data: { available_to_donate: boolean }) => {
        const response = await api.post('/donors/availability', data);
        return response.data;
    },
    searchDonors: async (params: LocationData & { blood_type: string }) => {
        const response = await api.get('/donors/search', { params });
        return response.data;
    }
};

// Blood Request Services
export const requestService = {
    createRequest: async (data: BloodRequestData) => {
        const response = await api.post('/blood-requests', data);
        return response.data;
    },
    getRequests: async (params?: { status?: string; blood_type?: string }) => {
        const response = await api.get('/blood-requests', { params });
        return response.data;
    },
    getRequest: async (id: number) => {
        const response = await api.get(`/blood-requests/${id}`);
        return response.data;
    },
    updateRequest: async (id: number, data: {
        status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
        additional_notes?: string;
    }) => {
        const response = await api.put(`/blood-requests/${id}`, data);
        return response.data;
    },
    deleteRequest: async (id: number) => {
        await api.delete(`/blood-requests/${id}`);
    },
    getNearbyRequests: async (params: LocationData) => {
        const response = await api.get('/blood-requests/nearby', { params });
        return response.data;
    },
    respondToRequest: async (requestId: number, data: { status: 'accepted' | 'rejected' }) => {
        const response = await api.post(`/blood-requests/${requestId}/respond`, data);
        return response.data;
    }
};

// Location Services
export const locationService = {
    getNearbyDonors: async (params: LocationData) => {
        const response = await api.get('/donors/nearby', { params });
        return response.data;
    },
    getNearbyHospitals: async (params: LocationData) => {
        const response = await api.get('/locations/hospitals', { params });
        return response.data;
    },
    getNearbyBloodBanks: async (params: LocationData) => {
        const response = await api.get('/locations/blood-banks', { params });
        return response.data;
    },
    getNearbyRequests: async (params: LocationData) => {
        const response = await api.get('/blood-requests/nearby', { params });
        return response.data;
    }
};

export default api; 