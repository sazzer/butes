import { newClient } from '../src';
import nock from 'nock';
import test from 'ava';

test('Access status code and headers', async (t) => {
  // Set up our API server
  const scope = nock('http://api.x.io')
    .get('/response')
    .reply(
      201,
      {
        class: ['testing'],
        title: 'Testing',
        properties: {
          hello: 'world'
        }
      },
      {
        'content-type': 'application/vnd.siren+json',
        ETag: '"abc"',
        'X-Request-ID': 'abc123'
      }
    );

  // Request the resource
  const client = newClient();
  const response = await client.get('http://api.x.io/response');

  t.is(response.getStatus(), 201);
  t.is(response.getHeaders().get('ETag'), '"abc"');
  t.is(response.getHeaders().get('X-Request-ID'), 'abc123');

  t.true(scope.isDone());
});
