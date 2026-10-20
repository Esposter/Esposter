## 1. Core

- [ ] 1.1 Decide the port's return shape (see the design's open question) and record the decision in the design. Verify: the design names the rejected alternative and the reason it lost.
- [ ] 1.2 Type the port's return per node type, and derive the core's string-keyed view once at the boundary. Verify: a test named after the scenario 'A read of an absent slot fails the typecheck', as a `@ts-expect-error` in `blockTypes.test-d.ts`, failing first, then passing.
- [ ] 1.3 Confirm the walks in `renderBlockNodes.ts` and the other core services read children without an assertion. Verify: the existing `renderBlockNodes.test.ts` passes with unchanged expectations, and the core's oxlint and ESLint are clean.

## 2. Consumers

- [ ] 2.1 Make each consumer's port return its node type's slots and check each still satisfies the narrower type. Verify: `pnpm exec tsc --noEmit` in `apps/web` and `packages/mjml-blocks` reports zero errors.
