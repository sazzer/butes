import * as resource from './resource';
import * as siren from './siren';

import { Client } from './client';
import { URL } from 'url';
import fetch from 'node-fetch';

/**
 * Standard implementation of the Client interface.
 */
export class ClientImpl implements Client {
  async get<T>(url: string): Promise<resource.Resource<T>> {
    const response = await fetch(url);
    const responseBody: siren.Response<T> = await response.json();

    return wrapResponse(this, url, responseBody);
  }
}

/**
 * Wrap an API response in a Resource representation.
 *
 * @param client The API client to use for making ongoing calls
 * @param url The URL that was called, to use as the base for relative URLs in the response
 * @param response The response to wrap
 */
export function wrapResponse<T>(client: Client, url: string, response: siren.Response<T>): resource.Resource<T> {
  const entityLinks = [];
  const entityRepresentations = [];
  (response.entities ?? []).forEach((entity) => {
    if (isEmbeddedLink(entity)) {
      entityLinks.push(wrapLink(client, url, entity));
    } else if (isEmbeddedRepresentation(entity)) {
      entityRepresentations.push(wrapEntity(client, url, entity));
    }
  });

  return {
    title: response.title,
    properties: response.properties,
    links: (response.links ?? []).map((link) => wrapLink(client, url, link)),
    entityLinks,
    entityRepresentations,
    actions: wrapActions(client, url, response.actions ?? []),
    ...wrapClasses(response.class ?? [])
  };
}

/**
 * Wrap a link from an API response in a Resource representation.
 *
 * @param client The API client to use for making ongoing calls
 * @param url The URL that was called, to use as the base for relative URLs in the response
 * @param link The link to wrap
 */
function wrapLink(client: Client, url: string, link: siren.EmbeddedLink): resource.EmbeddedLink {
  const href = new URL(link.href, url).href;

  return {
    href: href,
    title: link.title,
    type: link.type,
    ...wrapClasses(link.class ?? []),
    ...wrapRels(link.rel),
    fetch: () => client.get(href)
  };
}

/**
 * Wrap an entity from an API response in a Resource representation.
 *
 * @param client The API client to use for making ongoing calls
 * @param url The URL that was called, to use as the base for relative URLs in the response
 * @param entity The entity to wrap
 */
function wrapEntity(
  client: Client,
  url: string,
  entity: siren.EmbeddedRepresentation
): resource.EmbeddedRepresentation {
  const entityLinks = [];
  const entityRepresentations = [];
  (entity.entities ?? []).forEach((entity) => {
    if (isEmbeddedLink(entity)) {
      entityLinks.push(wrapLink(client, url, entity));
    } else if (isEmbeddedRepresentation(entity)) {
      entityRepresentations.push(wrapEntity(client, url, entity));
    }
  });

  return {
    title: entity.title,
    properties: entity.properties,
    links: (entity.links ?? []).map((link) => wrapLink(client, url, link)),
    entityLinks,
    entityRepresentations,
    actions: wrapActions(client, url, entity.actions ?? []),
    ...wrapClasses(entity.class ?? []),
    ...wrapRels(entity.rel)
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

/**
 * Wrap a list of actions as an object where the keys are the action names
 * @param client The API client to use for making ongoing calls
 * @param url The URL that was called, to use as the base for relative URLs in the response
 * @param actions The list of actions to wrap
 */
function wrapActions(client: Client, url: string, actions: siren.Action[]): { [name: string]: resource.Action } {
  const result: { [name: string]: resource.Action } = {};

  actions.forEach((action) => {
    const href = new URL(action.href, url).href;

    const fields: { [name: string]: resource.Field } = {};
    if (action.fields !== undefined) {
      action.fields.forEach((field) => {
        fields[field.name] = {
          type: field.type ?? 'text',
          value: field.value,
          title: field.title,
          ...wrapClasses(field.class ?? [])
        };
      });
    }

    result[action.name] = {
      href: href,
      method: action.method ?? 'GET',
      type: action.type ?? 'application/x-www-form-urlencoded',
      title: action.title,
      fields,
      ...wrapClasses(action.class ?? [])
    };
  });

  return result;
}

/**
 * Helper to build the object fields to work with classes
 * @param classes The classes to wrap
 */
function wrapClasses(classes: string[]): resource.HasClass {
  return {
    class: classes,
    hasClass: hasValue(classes),
    hasAllClasses: hasAllValues(classes),
    hasAnyClass: hasAnyValue(classes)
  };
}

/**
 * Helper to build the object fields to work with rels
 * @param rels The rels to wrap
 */
function wrapRels(rels: string[]): resource.HasRel {
  return {
    rel: rels,
    hasRel: hasValue(rels),
    hasAllRels: hasAllValues(rels),
    hasAnyRel: hasAnyValue(rels)
  };
}

/**
 * Helper to build a function to see if a single input is in the given list of matches
 * @param matches The values to match against
 */
function hasValue<T>(matches: T[]): (input: T) => boolean {
  return (input) => matches.indexOf(input) !== -1;
}

/**
 * Helper to build a function to see if all the inputs are in the given list of matches
 * @param matches The values to match against
 */
function hasAllValues<T>(matches: T[]): (input: T[]) => boolean {
  return (input) => {
    for (const value of input) {
      if (matches.indexOf(value) === -1) {
        return false;
      }
    }
    return true;
  };
}

/**
 * Helper to build a function to see if at least one of the inputs are in the given list of matches
 * @param matches The values to match against
 */
function hasAnyValue<T>(matches: T[]): (input: T[]) => boolean {
  return (input) => {
    for (const value of input) {
      if (matches.indexOf(value) !== -1) {
        return true;
      }
    }
    return false;
  };
}
