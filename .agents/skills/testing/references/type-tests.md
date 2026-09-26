# Type-Level Tests (`.test-d.ts`)

Read when writing a `.test-d.ts`, or asserting a `void` return or any other type-level contract.

- **Placement** — colocate beside the type file.
- **`describe` string** — `"{camelCaseName} type"`.
- **`test` descriptions** — enum value or type arg directly.
- **Assertion** — always `expectTypeOf(...).toEqualTypeOf<ExpectedType>()`.
- **A `void` return is asserted here, never at runtime** — `expectTypeOf(fn<[string]>).returns.returns.toEqualTypeOf<void>()`. `void` is a type-level contract, and `no-confusing-void-expression` bans asserting or assigning the expression in the `.test.ts`, which is left to assert observable effects only.
- **`expect.hasAssertions()`** — in every test body.
- **Prefer type-only fixtures** — drive `expectTypeOf` from a type expression (a type alias, `ReturnType<typeof fn>`, or `ReturnType<typeof fn<TypeArg>>` for a generic fn) rather than runtime schema values or one-line helpers (prevents unused-value/underscore/value-liveness lint churn).
