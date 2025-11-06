// frontend/clients/geocoding-api-client.js

// IMPORTANT: Use /api as base URL (Next.js proxy pattern)
// This points to Next.js API routes, NOT the backend directly
const API_BASE_URL = '/api';

class GeocodingAPIClient {
  /**
   * Get flood data for given coordinates
   * @param {Object} params - Query parameters
   * @param {number} params.latitude - Latitude coordinate
   * @param {number} params.longitude - Longitude coordinate
   * @returns {Promise<Array>} Array of flood data with coordinates
   */
  static async getCoordinates({ latitude, longitude }) {
    try {
      // Call Next.js proxy route
      // Browser calls: /api/coordinates?latitude=X&longitude=Y
      // Next.js proxies to: ${INTERNAL_API_URL}/coordinates/?latitude=X&longitude=Y
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/coordinates?${params}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch coordinates: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      throw error;
    }
  }

  /**
   * Geocode an address and get flood data
   * @param {Object} params - Request parameters
   * @param {string} params.address - Address string to geocode
   * @returns {Promise<Array>} Array of flood data with coordinates
   */
  static async geocodeAddress({ address }) {
    try {
      // Call Next.js proxy route
      // Browser calls: /api/address
      // Next.js proxies to: ${INTERNAL_API_URL}/address/
      const response = await fetch(`${API_BASE_URL}/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error(`Failed to geocode address: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get address
   * @param {Object} params - Query parameters
   * @param {number} params.latitude - Latitude coordinate
   * @param {number} params.longitude - Longitude coordinate
   * @returns {Promise<Object>} Object with address string
   */
  static async reverseGeocode({ latitude, longitude }) {
    try {
      // Call Next.js proxy route
      // Browser calls: /api/rev_geocode?latitude=X&longitude=Y
      // Next.js proxies to: ${INTERNAL_API_URL}/rev_geocode?latitude=X&longitude=Y
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/rev_geocode?${params}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to reverse geocode: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }
}

export default GeocodingAPIClient;

