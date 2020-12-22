import { Resource } from './resource';
import { RequestInit, Response } from 'node-fetch';

/**
 * The type to use for actually making API calls.
 * This is the exact same shape as the Fetch API, but anything that fits can be used.
 */
export type Fetcher = (url: string, request: RequestInit) => Promise<Response>;

/**
 * The actual Butes client used to talk to Siren APIs
 */
export interface Client {
  /**
   * Perform a GET request to the given URL and return the resource that was retrieved.
   *
   * @param url The URL to fetch the resource from
   */
  get<T>(url: string): Promise<Resource<T>>;
}

// Error to throw if an API response was not a supported Content Type
export class UnsupportedContentTypeError extends Error {
  // The response
  readonly response: Response;

  constructor(response: Response) {
    super(`API response was not a Siren response`);

    this.response = response;
    this.name = 'UnsupportedContentTypeError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
