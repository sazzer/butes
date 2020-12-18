/**
 * Representation of a Siren Entity.
 */
export interface Response<T> {
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
   * Describes the nature of an entity's content based on the current representation.
   * Possible values are implementation-dependent and should be documented.
   */
  readonly class?: string[];

  /**
   * A collection of related sub-entities.
   * If a sub-entity contains an href value, it should be treated as an embedded link.
   * Clients may choose to optimistically load embedded links.
   * If no href value exists, the sub-entity is an embedded entity representation that contains all the characteristics of a typical entity.
   * One difference is that a sub-entity MUST contain a rel attribute to describe its relationship to the parent entity.
   */
  readonly entities?: EmbeddedEntity[];

  /**
   * A collection of items that describe navigational links, distinct from entity relationships.
   * Link items should contain a rel attribute to describe the relationship and an href attribute to point to the target URI.
   * Entities should include a link rel to self.
   */
  readonly links?: EmbeddedLink[];

  /**
   * A collection of action objects.
   */
  readonly actions?: Action[];
}

/**
 * Base that all embedded entities must extend.
 */
export interface EmbeddedEntityBase {
  /**
   * Defines the relationship of the sub-entity to its parent, per Web Linking (RFC5988) and Link Relations.
   */
  readonly rel: string[];

  /**
   * Describes the nature of an entity's content based on the current representation.
   * Possible values are implementation-dependent and should be documented.
   */
  readonly class?: string[];

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
   * A collection of related sub-entities.
   * If a sub-entity contains an href value, it should be treated as an embedded link.
   * Clients may choose to optimistically load embedded links.
   * If no href value exists, the sub-entity is an embedded entity representation that contains all the characteristics of a typical entity.
   * One difference is that a sub-entity MUST contain a rel attribute to describe its relationship to the parent entity.
   */
  readonly entities?: EmbeddedEntity[];

  /**
   * A collection of items that describe navigational links, distinct from entity relationships.
   * Link items should contain a rel attribute to describe the relationship and an href attribute to point to the target URI.
   * Entities should include a link rel to self.
   */
  readonly links?: EmbeddedLink[];

  /**
   * A collection of action objects.
   */
  readonly actions?: Action[];
}

/**
 * An embedded entity, either an embedded link or an embedded representation.
 */
export type EmbeddedEntity = EmbeddedLink | EmbeddedRepresentation;

/**
 * Representation of an action that can be performed on a resource.
 */
export interface Action {
  /**
   * A string that identifies the action to be performed.
   */
  readonly name: string;

  /**
   * The URI of the action.
   */
  readonly href: string;

  /**
   * Describes the nature of an action based on the current representation.
   * Possible values are implementation-dependent and should be documented.
   */
  readonly class?: string[];

  /**
   * An enumerated attribute mapping to a protocol method.
   */
  readonly method?: string;

  /**
   * Descriptive text about the action.
   */
  readonly title?: string;

  /**
   * The encoding type for the request.
   */
  readonly type?: string;

  /**
   * A collection of fields.
   */
  readonly fields?: Field[];
}

/**
 * Representation of a field within an action.
 */
export interface Field {
  /**
   * A name describing the control.
   */
  readonly name: string;

  /**
   * Describes aspects of the field based on the current representation.
   * Possible values are implementation-dependent and should be documented.
   */
  readonly class?: string[];

  /**
   * The input type of the field.
   */
  readonly type?: string;

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
