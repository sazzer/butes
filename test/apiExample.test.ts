import { newClient } from '../src';
import nock from 'nock';
import test from 'ava';

test('Request API Example', async (t) => {
  // Set up our API server
  const scope = nock('http://api.x.io')
    .get('/orders/42')
    .reply(200, {
      class: ['order'],
      properties: {
        orderNumber: 42,
        itemCount: 3,
        status: 'pending'
      },
      entities: [
        {
          class: ['items', 'collection'],
          rel: ['http://x.io/rels/order-items'],
          href: 'http://api.x.io/orders/42/items'
        },
        {
          class: ['info', 'customer'],
          rel: ['http://x.io/rels/customer'],
          properties: {
            customerId: 'pj123',
            name: 'Peter Joseph'
          },
          links: [{ rel: ['self'], href: 'http://api.x.io/customers/pj123' }]
        }
      ],
      actions: [
        {
          name: 'add-item',
          title: 'Add Item',
          method: 'POST',
          href: 'http://api.x.io/orders/42/items',
          type: 'application/x-www-form-urlencoded',
          fields: [
            { name: 'orderNumber', type: 'hidden', value: '42' },
            { name: 'productCode', type: 'text' },
            { name: 'quantity', type: 'number' }
          ]
        }
      ],
      links: [
        { rel: ['self'], href: 'http://api.x.io/orders/42' },
        { rel: ['previous'], href: 'http://api.x.io/orders/41' },
        { rel: ['next'], href: 'http://api.x.io/orders/43' }
      ]
    });

  // Request the resource
  const client = newClient();
  const resource = await client.get('http://api.x.io/orders/42');

  // Assert the response
  t.is(resource.title, undefined);
  t.deepEqual(resource.class, ['order']);
  t.deepEqual(resource.properties, {
    orderNumber: 42,
    itemCount: 3,
    status: 'pending'
  });

  t.is(3, resource.links.length);

  t.deepEqual(resource.links[0].rel, ['self']);
  t.is(resource.links[0].href, 'http://api.x.io/orders/42');
  t.deepEqual(resource.links[0].class, []);
  t.is(resource.links[0].title, undefined);
  t.is(resource.links[0].type, undefined);

  t.deepEqual(resource.links[1].rel, ['previous']);
  t.is(resource.links[1].href, 'http://api.x.io/orders/41');
  t.deepEqual(resource.links[1].class, []);
  t.is(resource.links[1].title, undefined);
  t.is(resource.links[1].type, undefined);

  t.deepEqual(resource.links[2].rel, ['next']);
  t.is(resource.links[2].href, 'http://api.x.io/orders/43');
  t.deepEqual(resource.links[2].class, []);
  t.is(resource.links[2].title, undefined);
  t.is(resource.links[2].type, undefined);

  t.is(1, resource.entityLinks.length);

  t.is(resource.entityLinks[0].href, 'http://api.x.io/orders/42/items');
  t.deepEqual(resource.entityLinks[0].class, ['items', 'collection']);
  t.deepEqual(resource.entityLinks[0].rel, ['http://x.io/rels/order-items']);
  t.is(resource.entityLinks[0].title, undefined);
  t.is(resource.entityLinks[0].type, undefined);

  t.is(1, resource.entityRepresentations.length);

  t.deepEqual(resource.entityRepresentations[0].class, ['info', 'customer']);
  t.deepEqual(resource.entityRepresentations[0].rel, ['http://x.io/rels/customer']);
  t.deepEqual(resource.entityRepresentations[0].properties, {
    customerId: 'pj123',
    name: 'Peter Joseph'
  });
  t.deepEqual(resource.entityRepresentations[0].entityLinks, []);
  t.deepEqual(resource.entityRepresentations[0].entityRepresentations, []);
  t.deepEqual(resource.entityRepresentations[0].actions, {});
  t.is(resource.entityRepresentations[0].title, undefined);

  t.is(1, resource.entityRepresentations[0].links.length);

  t.deepEqual(resource.entityRepresentations[0].links[0].rel, ['self']);
  t.is(resource.entityRepresentations[0].links[0].href, 'http://api.x.io/customers/pj123');
  t.deepEqual(resource.entityRepresentations[0].links[0].class, []);
  t.is(resource.entityRepresentations[0].links[0].title, undefined);
  t.is(resource.entityRepresentations[0].links[0].type, undefined);

  t.is(Object.keys(resource.actions).length, 1);
  t.is(resource.actions['add-item'].href, 'http://api.x.io/orders/42/items');
  t.is(resource.actions['add-item'].method, 'POST');
  t.deepEqual(resource.actions['add-item'].class, []);
  t.is(resource.actions['add-item'].type, 'application/x-www-form-urlencoded');
  t.is(resource.actions['add-item'].title, 'Add Item');

  t.is(Object.keys(resource.actions['add-item'].fields).length, 3);

  t.is(resource.actions['add-item'].fields['orderNumber'].type, 'hidden');
  t.is(resource.actions['add-item'].fields['orderNumber'].value, '42');
  t.is(resource.actions['add-item'].fields['orderNumber'].title, undefined);
  t.deepEqual(resource.actions['add-item'].fields['orderNumber'].class, []);

  t.is(resource.actions['add-item'].fields['productCode'].type, 'text');
  t.is(resource.actions['add-item'].fields['productCode'].value, undefined);
  t.is(resource.actions['add-item'].fields['productCode'].title, undefined);
  t.deepEqual(resource.actions['add-item'].fields['productCode'].class, []);

  t.is(resource.actions['add-item'].fields['quantity'].type, 'number');
  t.is(resource.actions['add-item'].fields['quantity'].value, undefined);
  t.is(resource.actions['add-item'].fields['quantity'].title, undefined);
  t.deepEqual(resource.actions['add-item'].fields['quantity'].class, []);

  // Assert the server calls
  t.true(scope.isDone());
});
