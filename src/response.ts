import { Headers } from 'node-fetch';

/**
 * Interface that all API responses will implement
 */
export interface ApiResponse {
  /**
   * Get the status code of the HTTP response
   */
  getStatus(): number;

  /**
   * Get the headers of the HTTP response
   */
  getHeaders(): Headers;
}
