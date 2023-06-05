import { expect, test } from 'vitest'

import { BaseError } from './base.js'

test('BaseError', () => {
  expect(new BaseError('An error occurred.')).toMatchInlineSnapshot(`
    [WagmiError: An error occurred.

    Version: @wagmi/core@1.0.2]
  `)

  expect(
    new BaseError('An error occurred.', { details: 'details' }),
  ).toMatchInlineSnapshot(`
    [WagmiError: An error occurred.

    Details: details
    Version: @wagmi/core@1.0.2]
  `)

  expect(new BaseError('', { details: 'details' })).toMatchInlineSnapshot(`
    [WagmiError: An error occurred.

    Details: details
    Version: @wagmi/core@1.0.2]
  `)
})

test('BaseError (w/ docsPath)', () => {
  expect(
    new BaseError('An error occurred.', {
      details: 'details',
      docsPath: '/lol',
    }),
  ).toMatchInlineSnapshot(`
    [WagmiError: An error occurred.

    Docs: https://wagmi.sh/core/lol.html
    Details: details
    Version: @wagmi/core@1.0.2]
  `)
  expect(
    new BaseError('An error occurred.', {
      cause: new BaseError('error', { docsPath: '/docs' }),
    }),
  ).toMatchInlineSnapshot(`
    [WagmiError: An error occurred.

    Docs: https://wagmi.sh/core/docs.html
    Version: @wagmi/core@1.0.2]
  `)
  expect(
    new BaseError('An error occurred.', {
      cause: new BaseError('error'),
      docsPath: '/lol',
    }),
  ).toMatchInlineSnapshot(`
    [WagmiError: An error occurred.

    Docs: https://wagmi.sh/core/lol.html
    Version: @wagmi/core@1.0.2]
  `)
  expect(
    new BaseError('An error occurred.', {
      details: 'details',
      docsPath: '/lol',
      docsSlug: 'test',
    }),
  ).toMatchInlineSnapshot(`
    [WagmiError: An error occurred.

    Docs: https://wagmi.sh/core/lol.html#test
    Details: details
    Version: @wagmi/core@1.0.2]
  `)
})

test('BaseError (w/ metaMessages)', () => {
  expect(
    new BaseError('An error occurred.', {
      details: 'details',
      metaMessages: ['Reason: idk', 'Cause: lol'],
    }),
  ).toMatchInlineSnapshot(`
    [WagmiError: An error occurred.

    Reason: idk
    Cause: lol

    Details: details
    Version: @wagmi/core@1.0.2]
  `)
})

test('inherited BaseError', () => {
  const err = new BaseError('An error occurred.', {
    details: 'details',
    docsPath: '/lol',
  })
  expect(
    new BaseError('An internal error occurred.', {
      cause: err,
    }),
  ).toMatchInlineSnapshot(`
    [WagmiError: An internal error occurred.

    Docs: https://wagmi.sh/core/lol.html
    Details: details
    Version: @wagmi/core@1.0.2]
  `)
})

test('inherited Error', () => {
  const err = new Error('details')
  expect(
    new BaseError('An internal error occurred.', {
      cause: err,
      docsPath: '/lol',
    }),
  ).toMatchInlineSnapshot(`
    [WagmiError: An internal error occurred.

    Docs: https://wagmi.sh/core/lol.html
    Details: details
    Version: @wagmi/core@1.0.2]
  `)
})

test('walk: no predicate fn (walks to leaf)', () => {
  class FooError extends BaseError {}
  class BarError extends BaseError {}

  const err = new BaseError('test1', {
    cause: new FooError('test2', { cause: new BarError('test3') }),
  })
  expect(err.walk()).toMatchInlineSnapshot(`
    [WagmiError: test3

    Version: @wagmi/core@1.0.2]
  `)
})

test('walk: predicate fn', () => {
  class FooError extends BaseError {}
  class BarError extends BaseError {}

  const err = new BaseError('test1', {
    cause: new FooError('test2', { cause: new BarError('test3') }),
  })
  expect(err.walk((err) => err instanceof FooError)).toMatchInlineSnapshot(`
    [WagmiError: test2

    Version: @wagmi/core@1.0.2]
  `)
})