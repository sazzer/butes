# Butes

![CI](https://github.com/sazzer/butes/workflows/CI/badge.svg)

Butes is a client library for interacting with [Siren](https://github.com/kevinswiber/siren) APIs.

## Why Butes?

> According to Argonautica, Butes alone was compelled by the Sirens’ voices

Butes is a client library that is able to communicate with APIs built on Siren. This gives the ability to parse the responses, to follow links from one entity to another and to submit actions as defined by the entities.

## Using Butes

Butes is written in TypeScript, and so full type information is available as needed. This allows for TypeScript clients to make use of this safely, and for editors to automatically understand the types of objects to make working with it easier.

### Creating a Client

```javascript
import { newClient } from 'butes';

const client = newClient();
```

### Retrieving a resource

```javascript
const resource = await client.get('http://api.x.io/orders/42');
```

Once a resource has been retrieved, it can be accessed as a standard object, with the following fields:

- `resource.title`
- `resource.properties`
- `resource.class`
- `resource.links`
- `resource.entityLinks` - Sub-entities that are embedded links
- `resource.entityRepresentations` - Sub-entities that are embedded representations
- `resource.actions`

Additionally there are some helper methods to determine if classes - or rels, in the case of links - are available without having to manually inspect the entire array.

Note that the `link`, `entityLinks` and `entityRepresentations` are standard JavaScript arrays, and `actions` is a standard JavaScript object. This allows for all normal functionality to be used:

```javascript
const selfLink = resource.links.find((link) => link.hasRel('self'));
```

### Following links

Links can be followed by using the `fetch()` method. This is available on entries in the `resource.links` and `resource.entityLinks` arrays, and will perform a `GET` request to the `href` of the link, and return a new `Resource` representing the target of the link:

```javascript
const nextPage = await resource.links.find((link) => link.hasRel('next')).fetch();
```

### Submitting actions

Actions can be submitted in a similar manner, by using the `submit()` method. The difference here is that they take a payload to be submitted to the `href`, and that the means that the actions is submitted will be defined by the action. This includes the HTTP method, the URL and the content type of the request.

If the HTTP method is specified as `GET` then the payload will be converted to a querystring and appended onto to the URL. Otherwise it will be treated as a request body and encoded as appropriate.

At present the only encodings that are supported are:

- `application/json`
- `application/x-www-form-urlencoded`

### Problems

If an API call fails for some reason, Butes fully supports [RFC-7807 Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807). If a response is received with a content type of `application/problem+json` then a `ProblemError` will be thrown containing the details of the problem that occurred:

```javascript
try {
  await client.get('http://api.x.io/orders/unknown')
} catch (e) {
    const err = e as ProblemError;
    console.log(err.problem);
    // { "type": "not_found", "title": "Resource not found", "status": 404}
}
```
