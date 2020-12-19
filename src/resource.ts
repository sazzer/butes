export interface HasClass {
  /**
   * Describes the nature of an entity's content based on the current representation.
   * Possible values are implementation-dependent and should be documented.
   */
  readonly class: string[];

  /**
   * Check if this resource has the given class defined on it
   * @param input The class to look for
   */

  hasClass(input: string): boolean;

  /**
   * Check if this resource has all of the given classes defined on it
   * @param input The classes to look for
   */
  hasAllClasses(input: string[]): boolean;

  /**
   * Check if this resource has at least one of the given classes defined on it
   * @param input The classes to look for
   */
  hasAnyClass(input: string[]): boolean;
}

export interface HasRel {
  /**
   * Defines the relationship of the sub-entity to its parent, per Web Linking (RFC5988) and Link Relations.
   */
  readonly rel: string[];

  /**
   * Check if this resource has the given rel defined on it
   * @param input The rel to look for
   */

  hasRel(input: string): boolean;

  /**
   * Check if this resource has all of the given rels defined on it
   * @param input The rels to look for
   */
  hasAllRels(input: string[]): boolean;

  /**
   * Check if this resource has at least one of the given rels defined on it
   * @param input The rels to look for
   */
  hasAnyRel(input: string[]): boolean;
}

/**
 * Representation of a resource as loaded by a client.
 */
export interface Resource<T> extends HasClass {
  /**
   * Descriptive text about the entity.
   * Optional.
   */
  readonly title?: string;

  /**
   * A set of key-value pairs that describe the state of an entity.
   * Optional.
   */
  readonly properties?: T;

  /**
   * A collection of related links to sub-entities.
   */
  readonly entityLinks: EmbeddedLink[];

  /**
   * A collection of related embedded sub-entities.
   */
  readonly entityRepresentations: EmbeddedRepresentation[];

  /**
   * A collection of items that describe navigational links, distinct from entity relationships.
   * Link items should contain a rel attribute to describe the relationship and an href attribute to point to the target URI.
   * Entities should include a link rel to self.
   */
  readonly links: EmbeddedLink[];

  /**
   * A collection of action objects.
   */
  readonly actions: { [name: string]: Action };
}

/**
 * Base that all embedded entities must extend.
 */
export interface EmbeddedEntityBase extends HasClass, HasRel {
  /**
   * Descriptive text about the entity.
   */
  readonly title?: string;
}

/**
 * Representation of an embedded entity that is actually an embedded link.
 */
export interface EmbeddedLink extends EmbeddedEntityBase {
  /**
   * The URI of the linked sub-entity.
   */
  readonly href: string;

  /**
   * Defines media type of the linked sub-entity, per Web Linking (RFC5988).
   */
  readonly type?: string;

  /**
   * Actually fetch the resource that this link refers to
   */
  fetch<T>(): Promise<Resource<T>>;
}

/**
 * Representation of an embedded entity that is actually an embedded representation.
 */
export interface EmbeddedRepresentation extends EmbeddedEntityBase {
  /**
   * A set of key-value pairs that describe the state of an entity.
   * Optional.
   */
  readonly properties?: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * A collection of related links to sub-entities.
   */
  readonly entityLinks: EmbeddedLink[];

  /**
   * A collection of related embedded sub-entities.
   */
  readonly entityRepresentations: EmbeddedRepresentation[];

  /**
   * A collection of items that describe navigational links, distinct from entity relationships.
   * Link items should contain a rel attribute to describe the relationship and an href attribute to point to the target URI.
   * Entities should include a link rel to self.
   */
  readonly links: EmbeddedLink[];

  /**
   * A collection of action objects.
   */
  readonly actions: { [name: string]: Action };
}

/**
 * Representation of an action that can be performed on a resource.
 */
export interface Action extends HasClass {
  /**
   * The URI of the action.
   */
  readonly href: string;

  /**
   * An enumerated attribute mapping to a protocol method.
   */
  readonly method: string;

  /**
   * The encoding type for the request.
   */
  readonly type: string;

  /**
   * Descriptive text about the action.
   */
  readonly title?: string;

  /**
   * A collection of fields.
   */
  readonly fields: { [name: string]: Field };

  /**
   * Submit this action to the server and get the response.
   * @param payload The payload to submit
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submit<T>(payload: { [name: string]: any }): Promise<Resource<T>>;
}

/**
 * Representation of a field within an action.
 */
export interface Field extends HasClass {
  /**
   * The input type of the field.
   */
  readonly type: string;

  /**
   * A value assigned to the field.
   */
  readonly value?: string;

  /**
   * Textual annotation of a field.
   * Clients may use this as a label.
   */
  readonly title?: string;
}
