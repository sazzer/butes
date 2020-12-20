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
