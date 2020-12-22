import { Client, Fetcher } from './client';
import { ClientImpl } from './implementation';
import fetch from 'node-fetch';

export * from './client';
export * from './resource';
export * from './problem';

/**
 * Construct a new Client implementation that can be used to access a Siren API.
 *
 * @param fetcher An alternative means to make API calls.
 * @returns the Client implementation to use.
 */
export function newClient(fetcher?: Fetcher): Client {
  return new ClientImpl(fetcher ?? fetch);
}
