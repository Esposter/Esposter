import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";
// Everything typescript-eslint's strict/stylistic sets covered is now enforced natively by oxlint
// (see /docs/proposals/refactors/eslint-to-oxlint-migration). The only survivor is `no-restricted-syntax`:
// Oxlint has no selector-based rule yet, so these AST-selector bans stay on the ESLint side.
export default {
  // `protected` is still allowed — no `#` equivalent exists for subclass access.
  "no-restricted-syntax": [
    "error",
    ...restrictedSyntaxes,
    {
      // A `catch` swallows the failure into a control-flow branch the type system cannot see, which is what
      // Neverthrow's Result exists to replace; `try`/`finally` is `withFinalizer`/`withFinalizerAsync`. There is
      // No standing exception — the repo holds none — so this rule has no disable convention to learn.
      message:
        "`try`/`catch`/`finally` is banned — use `getResult`/`getResultAsync` (+ `withFinalizer`/`withFinalizerAsync` for cleanup) and `.match` on the Result. See the error-handling skill.",
      selector: "TryStatement",
    },
    {
      // The `A` prefix marks an abstract class, so an interface wearing it claims a construct it is not and
      // Sorts beside the classes it only resembles. The shared-shape interface takes `Base*` instead, which is
      // Also what the schema it sits beside is already called.
      message:
        "The `A` prefix is for abstract classes — name the interface after what it holds, or `Base*` where it is the shape its implementors share. See the naming skill.",
      selector: "TSInterfaceDeclaration[id.name=/^A[A-Z]/]",
    },
    {
      // One structure, one spelling: the repo's own lookup tables already fix the word order
      // (`EmojiGroupIconMap` is group -> icon), so a local reading `iconsByEmojiGroup` or `idToAlias` says the
      // Same thing a second way. Only the map's own name is matched — a function keeps its `By<Selector>`, which
      // Is why the `by*` branches exclude a function value or type: a map is data, and `byPage` on azure-mock's
      // `PagedAsyncIterableIterator` is the azure sdk's own paging contract rather than a lookup we named.
      message:
        "Name a map `<key><value>Map` (or `<value>Map` where the key is a field the value already carries) — not `<value>By<key>` or `<key>To<value>`. See the naming skill.",
      selector:
        ":matches(VariableDeclarator[id.name=/^[a-z][A-Za-z0-9]*(By|To)[A-Z]/]:matches([init.callee.name='Map'], [init.callee.object.name='Object'][init.callee.property.name='groupBy']), :matches(PropertyDefinition, Property)[key.name=/^by[A-Z]/]:not([value.type=/^(Arrow)?FunctionExpression$/]), TSPropertySignature[key.name=/^by[A-Z]/]:not([typeAnnotation.typeAnnotation.type='TSFunctionType']), VariableDeclarator[id.name=/^by[A-Z]/]:not([init.type=/^(Arrow)?FunctionExpression$/]))",
    },
    {
      message: "Use an ECMAScript `#` private member instead of the TypeScript `private` keyword.",
      selector:
        ":matches(PropertyDefinition, MethodDefinition, TSParameterProperty, TSAbstractPropertyDefinition, TSAbstractMethodDefinition)[accessibility='private']",
    },
    {
      message: "Avoid `expect.any` — capture the real value from the mock call and assert it exactly (or toBeTypeOf).",
      selector: "MemberExpression[object.name='expect'][property.name='any']",
    },
    {
      // Polling is banned repo-wide — see content/docs/architecture/no-polling.md.
      message:
        "Polling is banned — await the real completion signal (promises, events, flushPromises, waitForSynchronizedFunctions) instead of checking on a timer.",
      selector:
        ":matches(MemberExpression[object.name='expect'][property.name='poll'], MemberExpression[object.name='vi'][property.name=/^(waitFor|waitUntil)$/], CallExpression[callee.name=/^(waitFor|waitUntil)$/])",
    },
    {
      // Dates survive JSON only as strings, so the default parse has to revive them — see
      // /docs/architecture/serialization.md. Every place plain parsing is the deliberate choice (the content
      // Blobs and drafts a Zod schema coerces itself, payloads replayed verbatim, machine config) disables this
      // Rule on the line with its reason.
      message:
        "Use `jsonDateParse` from `@esposter/shared` — plain `JSON.parse` leaves every Date as an ISO string. Disable this rule with a reason where blanket revival is wrong (see /docs/architecture/serialization.md).",
      selector: "MemberExpression[object.name='JSON'][property.name='parse']",
    },
    {
      // The child combinators are load-bearing — they match only the property's own annotation, so
      // `Ref<T | undefined>`, `(T | undefined)[]`, tuple members and function params are untouched.
      message: "Declare the property optional (`field?: T`) instead of `field: T | undefined`.",
      selector:
        ":matches(TSPropertySignature, PropertyDefinition, TSAbstractPropertyDefinition) > TSTypeAnnotation > TSUnionType > TSUndefinedKeyword",
    },
    {
      // `useRoute()` resolves through the page's *injected* route, which is pinned to that page instance and
      // Freezes to its last value once the page is swapped out. Anything outliving the page it was created
      // Under — a Pinia store above all, cached for the app's lifetime — then answers for a route the user has
      // Already left, and a route naming no segment yields the `""` sentinel a uuid input rejects.
      message:
        "Use `useRouter().currentRoute` instead of `useRoute()` — the injected page route freezes when its page is swapped out, so anything outliving that page reads a stale route.",
      selector: "CallExpression[callee.name='useRoute']",
    },
  ],
  // Kept for later: enable via oxlint (`typescript/naming-convention`) once it supports the rule.
  // Computationally expensive under typescript-eslint, which is why it never shipped here.
  // "@typescript-eslint/naming-convention": [
  //   "error",
  //   {
  //     Format: ["camelCase", "PascalCase", "UPPER_CASE"],
  //     Selector: "variable",
  //     Types: ["array", "boolean", "number", "string"],
  //     LeadingUnderscore: "allow",
  //   },
  // ],
};
