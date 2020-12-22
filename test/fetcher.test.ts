import { newClient } from '../src';
import nock from 'nock';
import test from 'ava';
import fetch from 'node-fetch';

test('Access status code and headers', async (t) => {
  // Set up our API server
  const scope = nock('http://api.x.io').get('/fetcher').reply(
    200,
    {},
    {
      'content-type': 'application/vnd.siren+json'
    }
  );

  let fetched = '';

  // Request the resource
  const client = newClient((url, request) => {
    fetched = url;
    return fetch(url, request);
  });

  const response = await client.get('http://api.x.io/fetcher');

  t.is(response.getStatus(), 200);

  t.is(fetched, 'http://api.x.io/fetcher');

  t.true(scope.isDone());
});
