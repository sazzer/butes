import { newClient } from '../src';
import nock from 'nock';
import test from 'ava';

const URL_BASE = 'http://api.x.io';

function setupHome() {
  return nock(URL_BASE)
    .get('/')
    .reply(
      200,
      {
        title: 'API Home',
        entities: [
          {
            class: ['authentication'],
            rel: ['tag:butes,2020:rels/authentication'],
            href: '/authentication'
          }
        ]
      },
      {
        'content-type': 'application/vnd.siren+json'
      }
    );
}

function setupAuthenticationStart() {
  return nock(URL_BASE)
    .get('/authentication')
    .reply(
      200,
      {
        class: ['authentication'],
        links: [{ rel: ['self'], href: '/authentication' }],
        title: 'Authentication',
        actions: [
          {
            name: 'authenticate',
            title: 'Log In / Register',
            method: 'POST',
            href: '/authentication',
            type: 'application/x-www-form-urlencoded',
            fields: [
              {
                name: 'username',
                title: 'Username',
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
}

function setupSubmitAuthenticationKnownUser(username: string) {
  return nock(URL_BASE)
    .post('/authentication', `username=${username}`)
    .matchHeader('content-type', 'application/x-www-form-urlencoded')
    .reply(
      200,
      {
        class: ['authentication'],
        links: [{ rel: ['self'], href: '/authentication' }],
        title: 'Authenticate',
        actions: [
          {
            name: 'authenticate',
            title: 'Log In',
            method: 'POST',
            href: '/authenticate',
            type: 'application/json',
            fields: [
              {
                name: 'username',
                type: 'hidden',
                value: 'existingUser'
              },
              {
                name: 'password',
                title: 'Password',
                type: 'password'
              }
            ]
          }
        ]
      },
      {
        'content-type': 'application/vnd.siren+json'
      }
    );
}

function setupSubmitAuthenticationSuccess(username: string, password: string) {
  return nock(URL_BASE)
    .post('/authenticate', { username, password })
    .matchHeader('content-type', 'application/json')
    .reply(
      200,
      {
        class: ['authentication'],
        links: [{ rel: ['self'], href: '/authentication' }],
        title: 'Authenticated'
      },
      {
        'content-type': 'application/vnd.siren+json'
      }
    );
}

// This just gets the API home document
test('Get home document', async (t) => {
  const homeMock = setupHome();

  const client = newClient();
  const homeResource = await client.get('http://api.x.io/');

  t.is(homeResource.title, 'API Home');
  t.not(
    homeResource.entityLinks.find((link) => link.hasRel('tag:butes,2020:rels/authentication')),
    undefined
  );
  t.true(homeMock.isDone());
});

// This follows an entity link to another document
test('Get authentication document', async (t) => {
  const homeMock = setupHome();
  const authenticationMock = setupAuthenticationStart();

  const client = newClient();

  const homeResource = await client.get('http://api.x.io/');
  t.true(homeMock.isDone());

  const authenticationStartResource = await homeResource.entityLinks
    .find((link) => link.hasRel('tag:butes,2020:rels/authentication'))
    .fetch();

  t.is(authenticationStartResource.title, 'Authentication');
  t.true(authenticationMock.isDone());
});

// This submits an action as a form
test('Submit Username', async (t) => {
  const homeMock = setupHome();
  const authenticationMock = setupAuthenticationStart();
  const submitAuthenticationMock = setupSubmitAuthenticationKnownUser('testuser');

  const client = newClient();

  const homeResource = await client.get('http://api.x.io/');
  t.true(homeMock.isDone());

  const authenticationStartResource = await homeResource.entityLinks
    .find((link) => link.hasRel('tag:butes,2020:rels/authentication'))
    .fetch();
  t.true(authenticationMock.isDone());

  const authenticationResource = await authenticationStartResource.actions['authenticate'].submit({
    username: 'testuser'
  });
  t.true(submitAuthenticationMock.isDone());
  t.is(authenticationResource.title, 'Authenticate');
});

// This submits an action as a JSON payload
test('Submit Authentication', async (t) => {
  const homeMock = setupHome();
  const authenticationMock = setupAuthenticationStart();
  const submitAuthenticationMock = setupSubmitAuthenticationKnownUser('testuser');
  const authenticationSuccessMock = setupSubmitAuthenticationSuccess('testuser', 'password');

  const client = newClient();

  const homeResource = await client.get('http://api.x.io/');
  t.true(homeMock.isDone());

  const authenticationStartResource = await homeResource.entityLinks
    .find((link) => link.hasRel('tag:butes,2020:rels/authentication'))
    .fetch();
  t.true(authenticationMock.isDone());

  const authenticationResource = await authenticationStartResource.actions['authenticate'].submit({
    username: 'testuser'
  });
  t.true(submitAuthenticationMock.isDone());

  const authenticationResult = await authenticationResource.actions['authenticate'].submit({
    username: 'testuser',
    password: 'password'
  });
  t.true(authenticationSuccessMock.isDone());
  t.is(authenticationResult.title, 'Authenticated');
});
