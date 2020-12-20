import { Resource } from './resource';
import { Response } from 'node-fetch';

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

// Error to throw if an API response was not a Siren response
export class NotSirenResponseError extends Error {
  // The response
  readonly response: Response;

  constructor(response: Response) {
    super(`API response was not a Siren response`);

    this.response = response;
    this.name = 'NotSirenResponseError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
