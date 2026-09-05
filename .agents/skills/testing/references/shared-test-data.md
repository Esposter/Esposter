# Shared Test Data

The rule — never repeat a literal or object, and never re-declare what production already owns — is in `SKILL.md`. This page is the shapes that rule takes, and where each kind of value is scoped.

## Shapes

- **Repeated scalars and objects** — one `describe`-scope const (`const auth = ""`).
- **Near-identical objects** — a `base*` const plus spread and override (`{ ...baseMessage, userId: senderUserId }`).
- **Repeated arguments** — spread the constant part (`getX(db, { ...sender, message })`).
- **Uniform bulk inserts** — `.map()` over the varying key.
- **Event/envelope wrappers** — a `create*` helper taking only the varying payload, so call sites stay type-checked (`createEvent({ … } satisfies PayloadType)`).
- **Entity fixtures** — a `create*` helper annotated with the whole entity type, **every field spelled out**, plus a `Partial<T>` overrides parameter the caller spreads last. Listing the fields rather than casting a subset is what makes a new required column fail to compile at the fixture, instead of surfacing as a missing key in whichever suite happens to read it.

## Scope correctly

Values built from `beforeAll`/`beforeEach` state stay `let`; runtime-independent ones (UUIDs, literals, static objects) are `describe`-scope `const`. Never regenerate a UUID per test unless each test needs a unique one.

## Importing what production owns

A literal a sibling test uses inline is an undeclared constant: grep before adding a fixture, then hoist it and converge those call sites in the same edit.

A sentinel, cmdline marker, temp-file prefix, cache filename or env-var key production code owns is imported from the source, or the copy stays green while asserting the wrong thing after the source changes. Module-private, **export it** to the nearest `constants.ts`; taken as a **parameter**, still pass the real constant.

Numbers too: mirroring the source's sizing formula asserts your copy of it, so compute from the imported constant or assert the observable form (`Buffer.byteLength(JSON.stringify(chunk))`). Only a test-only value with no production counterpart stays a `*.test` constant.

## Rebuilt-per-test state

State that must be rebuilt per test (a mock DB, a wrapper to unmount, a store) is a `let` inside the `describe` callback, initialized in `beforeEach` — a helper reads it rather than taking it as an argument.

That is scoped to rebuilt-per-test state. An input that simply **differs between tests** stays a parameter (`mountFoo(route, activeCategory)`), never a `let` assigned before each call, which would manufacture the shared mutable state the rule exists to contain.
