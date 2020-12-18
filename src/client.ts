import { Resource } from './resource';

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
