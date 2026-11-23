import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

// Test-file-only bans, run over the tests beside the script bans, as the date bans are for `.vue`.
export const RESTRICTED_TEST_SYNTAXES: SelectorBanList = {
  bans: [
    {
      // A bare `vi.fn()` infers `unknown` parameters, so destructuring a recorded call is an implicit-`any` error
      // And `mockResolvedValue` accepts anything. Only the zero-argument form is banned: `vi.fn(impl)` infers its
      // Signature from the implementation and needs no annotation.
      message: "Give `vi.fn` its signature — `vi.fn<(input: Foo) => Promise<void>>()`.",
      selector:
        "CallExpression[callee.object.name='vi'][callee.property.name='fn'][arguments.length=0]:not([typeArguments]):not([typeParameters])",
    },
    {
      // A suite is one flat block naming what is under test; a group inside it is a second title the test name
      // Should carry. `describe.each` is a matrix rather than a group — the UI library runs every component suite
      // Once per design style — so only the bare call is matched on the inside.
      message:
        "Never nest a `describe` — put what the group said in each test's name. (`describe.each` over a matrix stays.) See the testing skill.",
      selector:
        "CallExpression:matches([callee.name='describe'], [callee.object.name='describe'], [callee.callee.object.name='describe']) CallExpression[callee.name='describe']",
    },
    {
      // Vitest 5.1 takes a `Temporal` value as the fake clock, so a moment past the epoch is an instant and never a
      // Millisecond count or a `Date`. The selector reads the argument's own syntax — a number or string literal, a
      // `new Date`, arithmetic, a `Duration`'s `.total` or an `.epochMilliseconds` read — since an identifier or a
      // Call has no type here to judge, and the clock's start is `useFakeTimers({ now: 0 })`, never a first call.
      message:
        "Hand `vi.setSystemTime` a `Temporal.Instant` — `Temporal.Instant.fromEpochMilliseconds(0).add({ minutes: 1 })` — never a millisecond count or a `Date`. See the test-values skill.",
      selector:
        "CallExpression[callee.object.name='vi'][callee.property.name='setSystemTime']:matches([arguments.0.type=/^(Literal|NewExpression|BinaryExpression|UnaryExpression)$/], [arguments.0.callee.property.name='total'], [arguments.0.property.name='epochMilliseconds'])",
    },
    {
      // The epoch is `0`, and that is the one `now` a count may spell: the least value, and what every other test
      // Value is measured from. Any later start is an instant, as `setSystemTime`'s is.
      message:
        "Start the fake clock at `now: 0` or a `Temporal.Instant` — `now: Temporal.Instant.fromEpochMilliseconds(1)` — never another millisecond count or a `Date`. See the test-values skill.",
      selector:
        "CallExpression[callee.object.name='vi'][callee.property.name='useFakeTimers'] > ObjectExpression > Property[key.name='now'] > :matches(NewExpression, BinaryExpression, UnaryExpression, Literal[value!=0], CallExpression[callee.property.name='total'], MemberExpression[property.name='epochMilliseconds'])",
    },
    {
      // A test's timeout is a named Temporal duration, so the constant's name says what the bench measured. A number in
      // The timeout slot says nothing of the cost, and a slow test that passes at the default has no timeout at all
      // (the Testing skill's timeouts page). Both places a timeout is written: the third argument and the `timeout`
      // Option
      message:
        "Name a test's timeout as a constant — `const SLOW_MS = Temporal.Duration.from({ seconds: 60 }).total(\"milliseconds\")` — never a literal. See the testing skill's timeouts page.",
      selector:
        "CallExpression:matches([callee.name='it'], [callee.name='test'], [callee.object.name='it'], [callee.object.name='test'])[arguments.2.type='Literal'], CallExpression:matches([callee.name='it'], [callee.name='test'], [callee.object.name='it'], [callee.object.name='test']) > ObjectExpression > Property[key.name='timeout'][value.type='Literal']",
    },
  ],
  files: ["**/*.test.ts", "**/test/setup.ts"],
};
