import * as resource from './resource';
import * as siren from './siren';

import { Client, UnsupportedContentTypeError } from './client';
import { Problem, ProblemError } from './problem';
import fetch, { RequestInit, Response } from 'node-fetch';

import { URL } from 'url';

/**
 * Standard implementation of the Client interface.
 */
export class ClientImpl implements Client {
  /**
   * Means to map the API response to the actual client response
   */
  private responseMappers: {
    [contentType: string]: <T>(response: Response, url: string) => Promise<resource.Resource<T>>;
  };

  constructor() {
    this.responseMappers = {
      'application/vnd.siren+json': async <T>(response, url) => {
        const responseBody: siren.Response<T> = await response.json();

        return wrapResponse(this, url, responseBody);
      },
      'application/problem+json': async (response) => {
        const problem = await wrapProblem(response);
        throw new ProblemError(problem);
      }
    };
  }

  async get<T>(url: string): Promise<resource.Resource<T>> {
    return await this.submit(url, {
      method: 'GET'
    });
  }

  async submit<T>(url: string, options: RequestInit): Promise<resource.Resource<T>> {
    const response = await fetch(url, options);

    const contentType = response.headers.get('content-type');
    const mapper = this.responseMappers[contentType];
    if (mapper === undefined) {
      throw new UnsupportedContentTypeError(response);
    } else {
      return mapper(response, url);
    }
  }
}

async function wrapProblem(response: Response): Promise<Problem> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responseBody: Record<string, any> = await response.json();

  const extra = {};
  Object.keys(responseBody)
    .filter((key) => key !== 'type')
    .filter((key) => key !== 'title')
    .filter((key) => key !== 'status')
    .filter((key) => key !== 'detail')
    .filter((key) => key !== 'instance')
    .forEach((key) => (extra[key] = responseBody[key]));

  return {
    type: responseBody.type ?? 'about:blank',
    title: responseBody.title,
    status: responseBody.status ?? response.status,
    detail: responseBody.detail,
    instance: responseBody.instance,
    extra
  };
}

/**
 * Wrap an API response in a Resource representation.
 *
 * @param client The API client to use for making ongoing calls
 * @param url The URL that was called, to use as the base for relative URLs in the response
 * @param response The response to wrap
 */
export function wrapResponse<T>(client: ClientImpl, url: string, response: siren.Response<T>): resource.Resource<T> {
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
function wrapLink(client: ClientImpl, url: string, link: siren.EmbeddedLink): resource.EmbeddedLink {
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
  client: ClientImpl,
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
function wrapActions(client: ClientImpl, url: string, actions: siren.Action[]): { [name: string]: resource.Action } {
  const result: { [name: string]: resource.Action } = {};

  actions.forEach((action) => {
    result[action.name] = wrapAction(client, url, action);
  });

  return result;
}

/**
 * Wrap a single action from an API response in a Resource representation.
 *
 * @param client The API client to use for making ongoing calls
 * @param url The URL that was called, to use as the base for relative URLs in the response
 * @param action The action to wrap
 */
function wrapAction(client: ClientImpl, url: string, action: siren.Action): resource.Action {
  const href = new URL(action.href, url).href;
  const method = action.method ?? 'GET';
  const type = action.type ?? 'application/x-www-form-urlencoded';

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

  return {
    href,
    method,
    type,
    title: action.title,
    fields,
    ...wrapClasses(action.class ?? []),
    submit: actionSubmitter(client, href, method, type)
  };
}

/**
 * Build a function by which an action can be submitted.
 *
 * @param client The API client to us for submitting the action
 * @param url The URL to which to submit the action
 * @param method The HTTP method to submit the action via
 * @param type The expected content type to use for the payload
 */
function actionSubmitter(
  client: ClientImpl,
  url: string,
  method: string,
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): <T>(payload: { [name: string]: any }) => Promise<resource.Resource<T>> {
  return async (payload) => {
    let body;
    if (type === 'application/json') {
      body = JSON.stringify(payload);
    } else if (type === 'application/x-www-form-urlencoded') {
      body = new URLSearchParams(payload);
    }

    return await client.submit(url, {
      method,
      headers: {
        'content-type': type
      },
      body
    });
  };
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
