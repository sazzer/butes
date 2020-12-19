import { ClientImpl, wrapResponse } from './implementation';

import test from 'ava';

const mockClient = {} as ClientImpl;

// Tests with an empty model
test('Parse empty model', (t) => {
  const resource = wrapResponse(mockClient, 'http://api.x.io/', {});

  t.is(resource.title, undefined);
  t.is(resource.properties, undefined);
  t.deepEqual(resource.links, []);
  t.deepEqual(resource.class, []);
  t.deepEqual(resource.actions, {});
  t.deepEqual(resource.entityLinks, []);
  t.deepEqual(resource.entityRepresentations, []);
});

test('Look up classes in empty model', (t) => {
  const resource = wrapResponse(mockClient, 'http://api.x.io/', {});

  t.false(resource.hasClass('unknown'));
  t.false(resource.hasAllClasses(['unknown']));
  t.false(resource.hasAnyClass(['unknown']));
});

const sirenResponse = {
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
      href: '/orders/42/items'
    },
    {
      class: ['info', 'customer'],
      rel: ['http://x.io/rels/customer'],
      properties: {
        customerId: 'pj123',
        name: 'Peter Joseph'
      },
      links: [{ rel: ['self'], href: '/customers/pj123' }]
    }
  ],
  actions: [
    {
      name: 'add-item',
      title: 'Add Item',
      method: 'POST',
      href: '/orders/42/items',
      type: 'application/x-www-form-urlencoded',
      fields: [
        { name: 'orderNumber', type: 'hidden', value: '42' },
        { name: 'productCode', type: 'text' },
        { name: 'quantity', type: 'number' }
      ]
    }
  ],
  links: [
    { rel: ['self'], href: '/orders/42' },
    { rel: ['previous'], href: '/orders/41' },
    { rel: ['next'], href: '/orders/43' }
  ]
};

// Tests with an full model
test('Parse full model', (t) => {
  const resource = wrapResponse(mockClient, 'http://api.x.io/', sirenResponse);

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
});

test('Look up classes in full model', (t) => {
  const resource = wrapResponse(mockClient, 'http://api.x.io/', sirenResponse);

  t.true(resource.hasClass('order'));
  t.false(resource.hasClass('unknown'));

  t.true(resource.hasAllClasses(['order']));
  t.false(resource.hasAllClasses(['unknown']));
  t.false(resource.hasAllClasses(['unknown', 'order']));
  t.false(resource.hasAllClasses(['order', 'unknown']));

  t.true(resource.hasAnyClass(['order']));
  t.false(resource.hasAnyClass(['unknown']));
  t.true(resource.hasAnyClass(['unknown', 'order']));
  t.true(resource.hasAnyClass(['order', 'unknown']));
});

test('Look up classes in embedded link', (t) => {
  const resource = wrapResponse(mockClient, 'http://api.x.io/', sirenResponse);

  const link = resource.entityLinks[0];

  t.true(link.hasClass('items'));
  t.true(link.hasClass('collection'));
  t.false(link.hasClass('unknown'));

  t.true(link.hasAllClasses(['items', 'collection']));
  t.false(link.hasAllClasses(['unknown']));
  t.false(link.hasAllClasses(['unknown', 'items', 'collection']));
  t.false(link.hasAllClasses(['items', 'collection', 'unknown']));

  t.true(link.hasAnyClass(['items', 'collection']));
  t.false(link.hasAnyClass(['unknown']));
  t.true(link.hasAnyClass(['unknown', 'items']));
  t.true(link.hasAnyClass(['collection', 'unknown']));
});

test('Look up classes in embedded resource', (t) => {
  const resource = wrapResponse(mockClient, 'http://api.x.io/', sirenResponse);

  const entity = resource.entityRepresentations[0];

  t.true(entity.hasClass('info'));
  t.true(entity.hasClass('customer'));
  t.false(entity.hasClass('unknown'));

  t.true(entity.hasAllClasses(['info', 'customer']));
  t.false(entity.hasAllClasses(['unknown']));
  t.false(entity.hasAllClasses(['unknown', 'info', 'customer']));
  t.false(entity.hasAllClasses(['info', 'customer', 'unknown']));

  t.true(entity.hasAnyClass(['info', 'customer']));
  t.false(entity.hasAnyClass(['unknown']));
  t.true(entity.hasAnyClass(['unknown', 'info']));
  t.true(entity.hasAnyClass(['customer', 'unknown']));
});

test('Look up rels in embedded link', (t) => {
  const resource = wrapResponse(mockClient, 'http://api.x.io/', sirenResponse);

  const link = resource.entityLinks[0];

  t.true(link.hasRel('http://x.io/rels/order-items'));
  t.false(link.hasRel('unknown'));

  t.true(link.hasAllRels(['http://x.io/rels/order-items']));
  t.false(link.hasAllRels(['unknown']));
  t.false(link.hasAllRels(['unknown', 'http://x.io/rels/order-items']));
  t.false(link.hasAllRels(['http://x.io/rels/order-items', 'unknown']));

  t.true(link.hasAnyRel(['http://x.io/rels/order-items']));
  t.false(link.hasAnyRel(['unknown']));
  t.true(link.hasAnyRel(['unknown', 'http://x.io/rels/order-items']));
  t.true(link.hasAnyRel(['http://x.io/rels/order-items', 'unknown']));
});

test('Look up rels in embedded resource', (t) => {
  const resource = wrapResponse(mockClient, 'http://api.x.io/', sirenResponse);

  const entity = resource.entityRepresentations[0];

  t.true(entity.hasRel('http://x.io/rels/customer'));
  t.false(entity.hasRel('unknown'));

  t.true(entity.hasAllRels(['http://x.io/rels/customer']));
  t.false(entity.hasAllRels(['unknown']));
  t.false(entity.hasAllRels(['unknown', 'http://x.io/rels/customer']));
  t.false(entity.hasAllRels(['http://x.io/rels/customer', 'unknown']));

  t.true(entity.hasAnyRel(['http://x.io/rels/customer']));
  t.false(entity.hasAnyRel(['unknown']));
  t.true(entity.hasAnyRel(['unknown', 'http://x.io/rels/customer']));
  t.true(entity.hasAnyRel(['http://x.io/rels/customer', 'unknown']));
});

test('Look up rels in link', (t) => {
  const resource = wrapResponse(mockClient, 'http://api.x.io/', sirenResponse);

  const link = resource.links[0];

  t.true(link.hasRel('self'));
  t.false(link.hasRel('unknown'));

  t.true(link.hasAllRels(['self']));
  t.false(link.hasAllRels(['unknown']));
  t.false(link.hasAllRels(['unknown', 'self']));
  t.false(link.hasAllRels(['self', 'unknown']));

  t.true(link.hasAnyRel(['self']));
  t.false(link.hasAnyRel(['unknown']));
  t.true(link.hasAnyRel(['unknown', 'self']));
  t.true(link.hasAnyRel(['self', 'unknown']));
});

test('Find link by rel', (t) => {
  const resource = wrapResponse(mockClient, 'http://api.x.io/', sirenResponse);

  const link = resource.links.find((link) => link.hasRel('previous'));
  t.is(link.href, 'http://api.x.io/orders/41');
});
