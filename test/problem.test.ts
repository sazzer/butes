import { ProblemError, newClient } from '../src';

import nock from 'nock';
import test from 'ava';

test('Simple Problem', async (t) => {
  // Set up our API server
  const scope = nock('http://api.x.io').get('/problem').reply(
    404,
    {
      type: 'not_found',
      title: 'Resource not found',
      status: 404
    },
    {
      'content-type': 'application/problem+json'
    }
  );

  // Request the resource
  const client = newClient();
  try {
    await client.get('http://api.x.io/problem');
    t.fail('Expected an exception');
  } catch (e) {
    t.true(e instanceof ProblemError);
    const err = e as ProblemError;

    t.is(err.problem.type, 'not_found');
    t.is(err.problem.title, 'Resource not found');
    t.is(err.problem.status, 404);
    t.is(err.problem.detail, undefined);
    t.is(err.problem.instance, undefined);
    t.deepEqual(err.problem.extra, {});

    t.true(scope.isDone());
  }
});

test('Empty Problem', async (t) => {
  // Set up our API server
  const scope = nock('http://api.x.io').get('/problem').reply(
    404,
    {
      title: 'Resource not found'
    },
    {
      'content-type': 'application/problem+json'
    }
  );

  // Request the resource
  const client = newClient();
  try {
    await client.get('http://api.x.io/problem');
    t.fail('Expected an exception');
  } catch (e) {
    t.true(e instanceof ProblemError);
    const err = e as ProblemError;

    t.is(err.problem.type, 'about:blank');
    t.is(err.problem.title, 'Resource not found');
    t.is(err.problem.status, 404);
    t.is(err.problem.detail, undefined);
    t.is(err.problem.instance, undefined);
    t.deepEqual(err.problem.extra, {});

    t.true(scope.isDone());
  }
});

test('Detailed Problem', async (t) => {
  // Set up our API server
  const scope = nock('http://api.x.io')
    .get('/problem')
    .reply(
      403,
      {
        type: 'https://example.com/probs/out-of-credit',
        title: 'You do not have enough credit.',
        detail: 'Your current balance is 30, but that costs 50.',
        instance: '/account/12345/msgs/abc',
        balance: 30,
        accounts: ['/account/12345', '/account/67890']
      },
      {
        'content-type': 'application/problem+json'
      }
    );

  // Request the resource
  const client = newClient();
  try {
    await client.get('http://api.x.io/problem');
    t.fail('Expected an exception');
  } catch (e) {
    t.true(e instanceof ProblemError);
    const err = e as ProblemError;

    t.is(err.problem.type, 'https://example.com/probs/out-of-credit');
    t.is(err.problem.title, 'You do not have enough credit.');
    t.is(err.problem.status, 403);
    t.is(err.problem.detail, 'Your current balance is 30, but that costs 50.');
    t.is(err.problem.instance, '/account/12345/msgs/abc');
    t.deepEqual(err.problem.extra, {
      balance: 30,
      accounts: ['/account/12345', '/account/67890']
    });

    t.true(scope.isDone());
  }
});
