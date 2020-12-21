import { newClient } from '../src';
import nock from 'nock';
import test from 'ava';

const URL_BASE = 'http://api.x.io';

test('Submit GET action', async (t) => {
  const homeMock = nock(URL_BASE)
    .get('/')
    .reply(
      200,
      {
        title: 'API Home',
        actions: [
          {
            name: 'get',
            href: '/get',
            fields: [
              {
                name: 'answer',
                type: 'text'
              }
            ]
          }
        ]
      },
      {
        'content-type': 'application/vnd.siren+json'
      }
    );
  const getMock = nock(URL_BASE).get('/get?answer=42').reply(
    200,
    {
      title: 'Answer'
    },
    {
      'content-type': 'application/vnd.siren+json'
    }
  );

  const client = newClient();

  const homeResource = await client.get('http://api.x.io/');
  t.is(homeResource.title, 'API Home');
  t.true(homeMock.isDone());

  const answerResource = await homeResource.actions['get'].submit({ answer: 42 });
  t.is(answerResource.title, 'Answer');
  t.true(getMock.isDone());
});

test('Submit HEAD action', async (t) => {
  const homeMock = nock(URL_BASE)
    .get('/')
    .reply(
      200,
      {
        title: 'API Home',
        actions: [
          {
            name: 'get',
            href: '/get',
            method: 'HEAD',
            fields: [
              {
                name: 'answer',
                type: 'text'
              }
            ]
          }
        ]
      },
      {
        'content-type': 'application/vnd.siren+json'
      }
    );
  const getMock = nock(URL_BASE).head('/get?answer=42').reply(200);

  const client = newClient();

  const homeResource = await client.get('http://api.x.io/');
  t.is(homeResource.title, 'API Home');
  t.true(homeMock.isDone());

  const answerResource = await homeResource.actions['get'].submit({ answer: 42 });
  t.is(answerResource.title, undefined);
  t.true(getMock.isDone());
});
