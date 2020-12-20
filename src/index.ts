import { Client } from './client';
import { ClientImpl } from './implementation';

export * from './client';
export * from './resource';
export * from './problem';

/**
 * Construct a new Client implementation that can be used to access a Siren API.
 *
 * @returns the Client implementation to use.
 */
export function newClient(): Client {
  return new ClientImpl();
}
