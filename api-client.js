// ========== API MODULE ==========
// This module handles all API calls to the backend

class APIClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.token = null;
    this.userLevel = 0;
  }

  // Set auth token and user level after login
  setAuth(token, userLevel) {
    this.token = token;
    this.userLevel = userLevel;
    localStorage.setItem('authToken', token);
    localStorage.setItem('userLevel', userLevel);
  }

  // Clear auth on logout
  clearAuth() {
    this.token = null;
    this.userLevel = 0;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userLevel');
  }

  // Get headers for API requests
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-user-level': this.userLevel.toString()
    };
  }

  // Generic API call method
  async apiCall(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: this.getHeaders()
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      console.log(`[API] ${method} ${this.baseUrl}${endpoint}`, data || '');
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      
      console.log(`[API Response] ${method} ${endpoint}: ${response.status}`);

      if (!response.ok) {
        const error = await response.json();
        console.error(`[API Error] ${method} ${endpoint}:`, error);
        throw new Error(error.error || 'API Error');
      }

      const result = await response.json();
      console.log(`[API Success] ${method} ${endpoint}:`, result);
      return result;
    } catch (error) {
      console.error(`[API Exception] ${endpoint}:`, error);
      throw error;
    }
  }

  // ========== AUTH ENDPOINTS ==========
  async login(password) {
    const result = await this.apiCall('/login', 'POST', { password });
    if (result.user) {
      this.setAuth(result.user.token, result.user.level);
    }
    return result;
  }

  // ========== SETTINGS ENDPOINTS ==========
  async getSettings() {
    return this.apiCall('/settings', 'GET');
  }

  async updateSettings(settings) {
    return this.apiCall('/settings', 'PUT', settings);
  }

  // ========== CATEGORIES ENDPOINTS ==========
  async getCategories() {
    return this.apiCall('/categories', 'GET');
  }

  async createCategory(category) {
    return this.apiCall('/categories', 'POST', category);
  }

  async updateCategory(id, updates) {
    return this.apiCall('/categories', 'PUT', { id, ...updates });
  }

  async deleteCategory(id) {
    return this.apiCall(`/categories?id=${id}`, 'DELETE');
  }

  // ========== FILES ENDPOINTS ==========
  async getFiles() {
    return this.apiCall('/files', 'GET');
  }

  async createFile(file) {
    return this.apiCall('/files', 'POST', file);
  }

  async updateFile(id, updates) {
    return this.apiCall('/files', 'PUT', { id, ...updates });
  }

  async deleteFile(id) {
    return this.apiCall(`/files?id=${id}`, 'DELETE');
  }

  // ========== FOLDERS ENDPOINTS ==========
  async getFolders() {
    return this.apiCall('/folders', 'GET');
  }

  async createFolder(folder) {
    return this.apiCall('/folders', 'POST', folder);
  }

  async updateFolder(id, updates) {
    return this.apiCall('/folders', 'PUT', { id, ...updates });
  }

  async deleteFolder(id) {
    return this.apiCall(`/folders?id=${id}`, 'DELETE');
  }

  // ========== ANNOUNCEMENTS ENDPOINTS ==========
  async getAnnouncements() {
    return this.apiCall('/announcements', 'GET');
  }

  async createAnnouncement(announcement) {
    return this.apiCall('/announcements', 'POST', announcement);
  }

  async deleteAnnouncement(id) {
    return this.apiCall(`/announcements?id=${id}`, 'DELETE');
  }

  // ========== FEATURED MEDIA ENDPOINTS ==========
  async getFeaturedMedia() {
    return this.apiCall('/featured-media', 'GET');
  }

  async createFeaturedMedia(item) {
    return this.apiCall('/featured-media', 'POST', item);
  }

  async updateFeaturedMedia(id, updates) {
    return this.apiCall('/featured-media', 'PUT', { id, ...updates });
  }

  async deleteFeaturedMedia(id) {
    return this.apiCall(`/featured-media?id=${id}`, 'DELETE');
  }

  // ========== SLIDER IMAGES ENDPOINTS ==========
  async getSliderImages() {
    return this.apiCall('/slider-images', 'GET');
  }

  async createSliderImage(image) {
    return this.apiCall('/slider-images', 'POST', image);
  }

  async updateSliderImage(id, updates) {
    return this.apiCall('/slider-images', 'PUT', { id, ...updates });
  }

  async deleteSliderImage(id) {
    return this.apiCall(`/slider-images?id=${id}`, 'DELETE');
  }
}

// Initialize API client
const api = new APIClient();

// Try to restore auth from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedToken = localStorage.getItem('authToken');
  const savedLevel = localStorage.getItem('userLevel');
  if (savedToken && savedLevel) {
    api.setAuth(savedToken, parseInt(savedLevel));
  }
});
