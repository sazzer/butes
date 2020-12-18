import { Client } from './client';
import { ClientImpl } from './implementation';

export { Client } from './client';
export * from './resource';

/**
 * Construct a new Client implementation that can be used to access a Siren API.
 *
 * @returns the Client implementation to use.
 */
export function newClient(): Client {
  return new ClientImpl();
}
