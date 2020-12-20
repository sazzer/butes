import { UnsupportedContentTypeError, newClient } from '../src';

import nock from 'nock';
import test from 'ava';

test('HAL Example', async (t) => {
  // Set up our API server
  const scope = nock('http://api.x.io')
    .get('/hal')
    .reply(
      200,
      {
        _links: {
          self: {
            href: '/hal'
          }
        }
      },
      {
        'content-type': 'application/hal+json'
      }
    );

  // Request the resource
  const client = newClient();
  try {
    await client.get('http://api.x.io/hal');
    t.fail('Expected an exception');
  } catch (e) {
    t.true(e instanceof UnsupportedContentTypeError);
    const err = e as UnsupportedContentTypeError;

    t.is(err.response.status, 200);
    t.is(err.response.headers.get('content-type'), 'application/hal+json');

    t.true(scope.isDone());
  }
});

test('Blank Content', async (t) => {
  // Set up our API server
  const scope = nock('http://api.x.io').get('/nocontent').reply(200);

  // Request the resource
  const client = newClient();
  try {
    await client.get('http://api.x.io/nocontent');
    t.fail('Expected an exception');
  } catch (e) {
    t.true(e instanceof UnsupportedContentTypeError);
    const err = e as UnsupportedContentTypeError;

    t.is(err.response.status, 200);
    t.is(err.response.headers.get('content-type'), null);

    t.true(scope.isDone());
  }
});

test('No Content', async (t) => {
  // Set up our API server
  const scope = nock('http://api.x.io').get('/nocontent').reply(204);

  // Request the resource
  const client = newClient();
  const response = await client.get('http://api.x.io/nocontent');

  t.is(response.title, undefined);
  t.is(response.properties, undefined);
  t.deepEqual(response.actions, {});
  t.deepEqual(response.links, []);
  t.deepEqual(response.entityLinks, []);
  t.deepEqual(response.entityRepresentations, []);

  t.true(scope.isDone());
});
