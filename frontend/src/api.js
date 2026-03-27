/*
 * API Service Layer
 * =================
 * This file centralizes ALL communication with the Django backend.
 * 
 * WHY A SEPARATE FILE?
 *   - Single source of truth for API URLs
 *   - Token handling in one place
 *   - Easy to change base URL (dev vs production)
 *   - Components just call api.login(), api.clockIn(), etc.
 * 
 * HOW FETCH WORKS:
 *   fetch(url, options) → Promise<Response>
 *   
 *   1. We send an HTTP request to the Django server
 *   2. Django processes it and returns JSON
 *   3. We parse the JSON with response.json()
 *   4. We return the data to the calling component
 * 
 * AUTHENTICATION FLOW:
 *   1. User logs in → Django returns a Token
 *   2. We store the token in localStorage
 *   3. Every subsequent request includes:
 *      Header: "Authorization: Token abc123..."
 *   4. Django's TokenAuthentication reads this header
 *      and sets request.user automatically
 */

const BASE_URL = 'https://attendr-backend-0eym.onrender.com/api';

/* ─── Helper: Get stored auth token ─── */
function getToken() {
  return localStorage.getItem('auth_token');
}

/* ─── Helper: Build headers for authenticated requests ─── */
function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
  };
}

/* ─── Helper: Make a fetch request and parse JSON ─── */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  // Parse JSON response
  const data = await response.json().catch(() => ({}));

  // If not OK (status 200-299), throw an error
  if (!response.ok) {
    const error = new Error(data.error || data.detail || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/* ═══════════════════════════════════════
   AUTH API CALLS
   ═══════════════════════════════════════ */

export async function login(username, password) {
  const data = await request('/accounts/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  // Store token for future requests
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function register(userData) {
  const data = await request('/accounts/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function logout() {
  try {
    await request('/accounts/logout/', { method: 'POST' });
  } finally {
    // Clear local storage even if API call fails
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}

export async function getProfile() {
  return request('/accounts/profile/');
}

/* ═══════════════════════════════════════
   ATTENDANCE API CALLS
   ═══════════════════════════════════════ */

export async function clockIn() {
  return request('/attendance/clock-in/', { method: 'POST' });
}

export async function clockOut() {
  return request('/attendance/clock-out/', { method: 'POST' });
}

export async function getTodayAttendance() {
  return request('/attendance/today/');
}

export async function getAttendanceHistory(month, year) {
  let endpoint = '/attendance/history/';
  const params = [];
  if (month) params.push(`month=${month}`);
  if (year) params.push(`year=${year}`);
  if (params.length) endpoint += `?${params.join('&')}`;
  return request(endpoint);
}

export async function getDashboard() {
  return request('/attendance/dashboard/');
}

/* ═══════════════════════════════════════
   LEAVE API CALLS
   ═══════════════════════════════════════ */

export async function getLeaveRequests() {
  return request('/attendance/leave/');
}

export async function submitLeaveRequest(leaveData) {
  return request('/attendance/leave/', {
    method: 'POST',
    body: JSON.stringify(leaveData),
  });
}

export async function cancelLeaveRequest(id) {
  return request(`/attendance/leave/${id}/`, { method: 'DELETE' });
}

/* ─── Check if user is currently logged in ─── */
export function isAuthenticated() {
  return !!getToken();
}

export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}
