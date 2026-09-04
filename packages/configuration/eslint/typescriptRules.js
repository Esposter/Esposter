import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";
// The map-naming selector reads these three shapes in every branch, so each is written once: the two name
// Patterns it matches, and the type references that say the annotated thing is a lookup table.
const MAP_NAME_REGEX = "/^[a-z][A-Za-z0-9]*(By|To)[A-Z]/";
const BY_MAP_NAME_REGEX = "/^[a-z][A-Za-z0-9]*By[A-Z]/";
const MAP_TYPE_NAME_REGEX = "/^(Map|ReadonlyMap|Record)$/";
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
      // Same thing a second way. Every branch reads what the name is attached to rather than the name alone,
      // Because the shape is what makes it a lookup: a map is data, so a function keeps its `By<Selector>`
      // (`getDataSourceTypeByFileName`), `byPage` on azure-mock's `PagedAsyncIterableIterator` is the azure
      // Sdk's own paging contract, and `isGroupedByType` is a boolean. So a lookup is recognised by a
      // `Map`/`Record` annotation, a `new Map`/`Object.groupBy` initialiser, or an object literal — and the
      // Object-literal branches take the `By` infix only, since `To` collides with the `usersToRooms` join
      // Table's own name, which reads as `<key>To<value>` and is no more ours to rename than `byPage`. A lookup
      // Built inside a `computed` is the same lookup — the initialiser is the `computed` call rather than the
      // `new Map`, so the arrow's body is read directly instead of by descent, which would report the wrong node
      // And catch a `Map` built anywhere deeper for some other purpose.
      message:
        "Name a map `<key><value>Map` (or `<value>Map` where the key is a field the value already carries) — not `<value>By<key>` or `<key>To<value>`. See the naming skill.",
      selector: `:matches(VariableDeclarator[id.name=${MAP_NAME_REGEX}]:matches([init.callee.name='Map'], [init.callee.object.name='Object'][init.callee.property.name='groupBy'], [id.typeAnnotation.typeAnnotation.typeName.name=${MAP_TYPE_NAME_REGEX}], [init.callee.name='computed'][init.arguments.0.body.callee.name='Map'], [init.callee.name='computed'][init.arguments.0.body.callee.object.name='Object'][init.arguments.0.body.callee.property.name='groupBy']), VariableDeclarator[id.name=${BY_MAP_NAME_REGEX}]:matches([init.type='ObjectExpression'], [init.expression.type='ObjectExpression']), :matches(PropertyDefinition, TSPropertySignature)[key.name=${MAP_NAME_REGEX}][typeAnnotation.typeAnnotation.typeName.name=${MAP_TYPE_NAME_REGEX}], Property[key.name=${BY_MAP_NAME_REGEX}]:matches([value.type='ObjectExpression'], [value.callee.name='Map'], [value.callee.object.name='Object'][value.callee.property.name='groupBy']), :matches(PropertyDefinition, Property)[key.name=/^by[A-Z]/]:not([value.type=/^(Arrow)?FunctionExpression$/]), TSPropertySignature[key.name=/^by[A-Z]/]:not([typeAnnotation.typeAnnotation.type='TSFunctionType']), VariableDeclarator[id.name=/^by[A-Z]/]:not([init.type=/^(Arrow)?FunctionExpression$/]))`,
    },
    {
      // A boolean says what is true, not what is permitted: `can`/`should` name a policy the value does not
      // Carry, and the repo already spells a permission check `hasManageRoles` and a capability check
      // `isScreenShareSupported`. Only a **named** declarator is matched, so a dependency's own key stays its own —
      // LiveKit's `canPublish`/`canSubscribe` grants and `URL.canParse` are read and written under their names.
      // A destructuring pattern is therefore out of scope on purpose rather than by omission: the name in
      // `const { canPublish } = grant` is the foreign object's, so the only way to satisfy the rule there is to
      // Rename on the spot and desync our vocabulary from the sdk's at every call site. A boolean we author has
      // Its own declarator, which this does match.
      message:
        "Name a boolean `is*` (or `has*` for possession/membership) — `can*` and `should*` name a policy rather than the value. See the naming skill.",
      selector: "VariableDeclarator[id.name=/^(can|should)[A-Z]/]",
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
