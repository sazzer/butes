import * as resource from './resource';
import * as siren from './siren';

import { Client } from './client';
import fetch from 'node-fetch';

/**
 * Standard implementation of the Client interface.
 */
export class ClientImpl implements Client {
  async get<T>(url: string): Promise<resource.Resource<T>> {
    const response = await fetch(url);
    const responseBody: siren.Response<T> = await response.json();

    return wrapResponse(this, responseBody);
  }
}

/**
 * Wrap an API response in a Resource representation.
 *
 * @param client The API client to use for making ongoing calls
 * @param response The response to wrap
 */
function wrapResponse<T>(client: Client, response: siren.Response<T>): resource.Resource<T> {
  const entityLinks = [];
  const entityRepresentations = [];
  (response.entities ?? []).forEach((entity) => {
    if (isEmbeddedLink(entity)) {
      entityLinks.push(wrapLink(client, entity));
    } else if (isEmbeddedRepresentation(entity)) {
      entityRepresentations.push(wrapEntity(client, entity));
    }
  });

  return {
    title: response.title,
    properties: response.properties,
    class: response.class ?? [],
    links: (response.links ?? []).map((link) => wrapLink(client, link)),
    entityLinks,
    entityRepresentations,
    actions: wrapActions(client, response.actions ?? [])
  };
}

/**
 * Wrap a link from an API response in a Resource representation.
 *
 * @param client The API client to use for making ongoing calls
 * @param link The link to wrap
 */
function wrapLink(client: Client, link: siren.EmbeddedLink): resource.EmbeddedLink {
  return {
    class: link.class ?? [],
    href: link.href,
    rel: link.rel,
    title: link.title,
    type: link.type
  };
}

/**
 * Wrap an entity from an API response in a Resource representation.
 *
 * @param client The API client to use for making ongoing calls
 * @param entity The entity to wrap
 */
function wrapEntity(client: Client, entity: siren.EmbeddedRepresentation): resource.EmbeddedRepresentation {
  const entityLinks = [];
  const entityRepresentations = [];
  (entity.entities ?? []).forEach((entity) => {
    if (isEmbeddedLink(entity)) {
      entityLinks.push(wrapLink(client, entity));
    } else if (isEmbeddedRepresentation(entity)) {
      entityRepresentations.push(wrapEntity(client, entity));
    }
  });

  return {
    rel: entity.rel ?? [],
    class: entity.class ?? [],
    title: entity.title,
    properties: entity.properties,
    links: (entity.links ?? []).map((link) => wrapLink(client, link)),
    entityLinks,
    entityRepresentations,
    actions: wrapActions(client, entity.actions ?? [])
  };
}

/**
 * Type guard to see if an Embedded Entity is actually an Embedded Link
 * @param object The object to check
 */
function isEmbeddedLink(object: siren.EmbeddedEntity): object is siren.EmbeddedLink {
  return 'href' in object;
}

/**
 * Type guard to see if an Embedded Entity is actually an Embedded Representation
 * @param object The object to check
 */
function isEmbeddedRepresentation(object: siren.EmbeddedEntity): object is siren.EmbeddedRepresentation {
  return !('href' in object);
}

function wrapActions(client: Client, actions: siren.Action[]): { [name: string]: resource.Action } {
  const result: { [name: string]: resource.Action } = {};

  actions.forEach((action) => {
    const fields: { [name: string]: resource.Field } = {};
    if (action.fields !== undefined) {
      action.fields.forEach((field) => {
        fields[field.name] = {
          class: field.class ?? [],
          type: field.type ?? 'text',
          value: field.value,
          title: field.title
        };
      });
    }

    result[action.name] = {
      href: action.href,
      method: action.method ?? 'GET',
      type: action.type ?? 'application/x-www-form-urlencoded',
      class: action.class ?? [],
      title: action.title,
      fields
    };
  });

  return result;
}
