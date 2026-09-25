import restrictedImportSyntaxes from "@esposter/configuration/eslint/restrictedImportSyntaxes.js";
import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";
// The map-naming selector reads these three shapes in every branch, so each is written once: the two name
// Patterns it matches, and the type references that say the annotated thing is a lookup table.
const MAP_NAME_REGEX = "/^[a-z][A-Za-z0-9]*(By|To)[A-Z]/";
const BY_MAP_NAME_REGEX = "/^[a-z][A-Za-z0-9]*By[A-Z]/";
const MAP_TYPE_NAME_REGEX = "/^(Map|ReadonlyMap|Record)$/";
// Only `no-restricted-syntax` lives on the ESLint side: oxlint enforces the rest natively but has no
// Selector-based rule, so these AST-selector bans have nowhere else to go
// (see /docs/architecture/lint-toolchain).
export default {
  // `protected` is still allowed — no `#` equivalent exists for subclass access.
  "no-restricted-syntax": [
    "error",
    ...restrictedSyntaxes,
    ...restrictedImportSyntaxes,
    {
      // A `catch` swallows the failure into a control-flow branch the type system cannot see, which is what
      // Neverthrow's Result exists to replace; `try`/`finally` is `withFinalizer`/`withFinalizerAsync`. There is
      // No standing exception — the repo holds none — so this rule has no disable convention to learn.
      message:
        "`try`/`catch`/`finally` is banned — use `getResult`/`getResultAsync` (+ `withFinalizer`/`withFinalizerAsync` for cleanup) and `.match` on the Result. See the error-handling skill.",
      selector: "TryStatement",
    },
    {
      // An enum member is a name in code, so it takes the code's casing whatever the value it stands for is spelled
      // As: `Dark = "dark"`. The one exception is a standard notation whose casing is its meaning, the date format
      // Tokens, behind a disable. A lone capital is PascalCase; two or more with nothing lowercase is SCREAMING_CASE
      message: 'An enum member is PascalCase; its value keeps the outside spelling (`Dark = "dark"`).',
      selector: "TSEnumMember[id.type='Identifier'][id.name=/^[a-z]|_|^[A-Z][A-Z0-9]+$/]",
    },
    {
      // The caller's device is one function, and this literal is how a second spelling of it starts: the pair is
      // What every event emitter takes to skip the client that caused the event, so it is written in one place.
      message:
        "Use `getDevice(getSessionPayload)` (server/services/auth/getDevice) rather than spelling the device literal.",
      selector:
        "ObjectExpression[properties.length=2][properties.0.key.name='sessionId'][properties.0.value.property.name='id'][properties.0.value.object.property.name='session'][properties.0.value.object.object.property.name='getSessionPayload'][properties.1.key.name='userId'][properties.1.value.property.name='id'][properties.1.value.object.property.name='user'][properties.1.value.object.object.property.name='getSessionPayload']",
    },
    {
      // The `InMessage` suffix names the Postgres schema a message table sits in, and the table's own name is
      // Already the plural — so a relation key or a local spelled `bansInMessages` has pluralised the schema, and
      // Reads as bans across messages. The suffix is dropped from a variable (`const ban`) or kept whole as the
      // Table's name (`r.many.bansInMessage`); nothing spells it plural. Unanchored, because a through-relation
      // Key carries the table's name mid-word (`roomsInMessageViaInvitesInMessage`), which an end anchor passes
      message:
        "`InMessage` is a schema suffix, not a noun — the table's own name is the plural, so drop the `s`. See the naming skill and the drizzle relations reference.",
      selector:
        ":matches(Property, VariableDeclarator, PropertyDefinition, TSPropertySignature)[key.name=/InMessages/], VariableDeclarator[id.name=/InMessages/]",
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
      // SDK's own paging contract, and `isGroupedByType` is a boolean. So a lookup is recognised by a
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
      // A call that answers with a boolean is `check*`; `get*` reads as a derivation, so the family grows
      // Unnoticed. The name is all the selector sees, and it is enough: a `getIs*`/`getHas*` answers with a
      // Boolean, and a getter that builds something says what — `getIsLoadedRef` is a destructuring rename off
      // `useDataMap`, which is a pattern rather than an identifier and stays outside
      message:
        "Name a boolean-returning function `check*` — `getIs*`/`getHas*` reads as a derivation. See the naming skill.",
      selector: "VariableDeclarator[id.name=/^get(Is|Has)[A-Z]/]",
    },
    {
      // The other half of the same family: `is*`/`has*` is a stored boolean, so a function under that name
      // Reads as a value at every call site. The annotation is what makes it decidable without types — a
      // Function whose declared return is `boolean` or a type predicate answers with one and is `check*`.
      message:
        "Name a boolean-returning function `check*` — `is*`/`has*` is a stored boolean, never a call. See the naming skill.",
      selector:
        "VariableDeclarator[id.name=/^(is|has)[A-Z]/][init.type=/^(Arrow)?FunctionExpression$/] > :matches(ArrowFunctionExpression, FunctionExpression) > TSTypeAnnotation.returnType > :matches(TSBooleanKeyword, TSTypePredicate)",
    },
    {
      // A where-fragment helper builds a clause, so it is a `get*`: the bare noun (`roomWhere = (id) => …`)
      // Reads as the clause itself rather than the call that builds it. See the trpc skill.
      message:
        "Name a where-fragment builder `get*Where` — the bare `*Where` noun is the clause, not the call that builds it.",
      selector:
        "VariableDeclarator[id.name=/(?<!By)Where$/][id.name!=/^get/][init.type=/^(Arrow)?FunctionExpression$/]",
    },
    {
      message: "Use an ECMAScript `#` private member instead of the TypeScript `private` keyword.",
      selector:
        ":matches(PropertyDefinition, MethodDefinition, TSParameterProperty, TSAbstractPropertyDefinition, TSAbstractMethodDefinition)[accessibility='private']",
    },
    {
      // The child combinators are load-bearing — they match only the property's own annotation, so
      // `Ref<T | undefined>`, `(T | undefined)[]`, tuple members and function params are untouched.
      message: "Declare the property optional (`field?: T`) instead of `field: T | undefined`.",
      selector:
        ":matches(TSPropertySignature, PropertyDefinition, TSAbstractPropertyDefinition) > TSTypeAnnotation > TSUnionType > TSUndefinedKeyword",
    },
    {
      // An app-owned string is `string` with `""` as its empty sentinel, checked by truthiness — a bare
      // `ref<string>()` is `Ref<string | undefined>`, which puts a second empty value beside the one the repo reads.
      // Only the `string` argument is matched: an optional ref of anything else omits its initial value on purpose
      message:
        'A string ref starts at the `""` sentinel — `ref("")`, never `ref<string>()`, which adds `undefined` as a second empty value. See the typescript skill.',
      selector:
        "CallExpression[callee.name=/^(ref|shallowRef)$/][arguments.length=0][typeArguments.params.length=1][typeArguments.params.0.type='TSStringKeyword']",
    },
    {
      // `ref()` already starts at `undefined`, so the argument only restates the default. The type check is
      // Load-bearing: esquery compares an absent `name` as the string "undefined", which every literal would match
      message: "Omit the initial value of an optional ref — `ref<T>()`, never `ref<T | undefined>(undefined)`.",
      selector:
        "CallExpression[callee.name=/^(ref|shallowRef)$/][arguments.length=1][arguments.0.type='Identifier'][arguments.0.name='undefined']",
    },
    {
      // Which build is running is read once, in `shared/util/environment/constants.ts`, and named there — that file
      // Is the one site that reads the flags themselves, so it disables this with that reason
      message:
        "Use `IS_PRODUCTION`/`IS_DEVELOPMENT`/`IS_TEST` from `#shared/util/environment/constants` rather than reading the build mode off `import.meta`. See the typescript skill.",
      selector:
        "MemberExpression[object.type='MetaProperty'][property.name='dev'], MemberExpression[object.object.type='MetaProperty'][object.property.name='env'][property.name=/^(DEV|MODE|PROD)$/]",
    },
    {
      // An export list names a binding a second time, away from its declaration, so a reader finds what a module
      // Exports in two places. A re-export carries `from` and an empty `export {}` in a `.d.ts` carries no
      // Specifier, so neither is matched — the generated barrels and every `eslint.config.js` stay as they are
      message:
        "Export at the declaration — `export const`/`class`/`interface`/`type`/`function` — never an `export { … }` list. See the file-organization skill.",
      selector: "ExportNamedDeclaration[source=null][specifiers.length>0]",
    },
    {
      // Every persisted browser key is an entry in the one registry, so an overlap between two features is visible
      // Where the keys sit together; a literal at the call is a key nothing else can see
      message:
        "Name a localStorage key through the `LocalStorageKey` registry (`app/services/shared/LocalStorageKey.ts`), never a literal at the call. See the file-organization skill.",
      selector:
        ":matches(CallExpression[callee.name='useLocalStorage'], CallExpression[callee.property.name=/^(getItem|removeItem|setItem)$/]:matches([callee.object.name='localStorage'], [callee.object.property.name='localStorage']))[arguments.0.type=/^(Literal|TemplateLiteral)$/]",
    },
    {
      // Destructuring an event detaches its methods from the event they read `this` off, so a `preventDefault`
      // Pulled out that way throws "Illegal invocation" — and a handler reading only a field today is the one that
      // Grows the method call tomorrow. A parameter is known to be an event by a DOM `*Event` annotation, or by the
      // Listener API it is handed to; a component's emitted payload is neither, so destructuring one stays allowed
      message:
        'Keep the whole `event` parameter — destructuring it detaches its methods (`preventDefault` throws "Illegal invocation"). Read `event.key` instead. See the vue skill.',
      selector:
        ":function > ObjectPattern.params[typeAnnotation.typeAnnotation.typeName.name=/Event$/], CallExpression:matches([callee.name=/^(onKeyStroke|useEventListener)$/], [callee.property.name='addEventListener']) > :function.arguments > ObjectPattern.params",
    },
    {
      // Zod 4 still parses the Zod 3 spellings, so a second form of each builder would sit in the tree with nothing
      // Failing. The chained validators are matched only when the chain starts at the `z.string()`/`z.number()`/
      // `z.object()` they refine, since `date`, `time` and `url` are ordinary method names everywhere else — so the
      // Node reported is that opening call
      message:
        "Use the Zod 4 top-level builder — `z.email()`, `z.url()`, `z.uuid()`, `z.int()`, `z.iso.datetime()`, `z.strictObject()`, `z.looseObject()`, `z.enum(SomeEnum)` — never the Zod 3 chain or `z.nativeEnum`. See the zod skill.",
      selector:
        "MemberExpression[object.name='z'][property.name='nativeEnum'], CallExpression[callee.property.name=/^(base64|base64url|cidr|cuid|cuid2|date|datetime|duration|email|emoji|guid|ip|ipv4|ipv6|nanoid|time|ulid|url|uuid)$/] > MemberExpression.callee CallExpression[callee.object.name='z'][callee.property.name='string'], CallExpression[callee.property.name='int'] > MemberExpression.callee CallExpression[callee.object.name='z'][callee.property.name='number'], CallExpression[callee.property.name=/^(passthrough|strict)$/] > MemberExpression.callee CallExpression[callee.object.name='z'][callee.property.name='object']",
    },
    {
      // Zod 3's `message` still parses under Zod 4, so a refinement written either way works and the tree would hold
      // Two spellings of one key. The `message` of an issue pushed onto `ctx` is a different object and keeps its name
      message:
        "A refinement's custom text goes under `error` — `.refine(check, { error: \"…\" })` — never Zod 3's `message`. See the zod skill.",
      selector:
        "CallExpression[callee.property.name=/^(refine|superRefine)$/] > ObjectExpression.arguments > Property[key.name='message']",
    },
    {
      // The Pulumi logical name is the Azure resource name here, so an alias can never serve the rename it is
      // Suggested for — a rename replaces through the name property whatever the URN says. A resource's options are
      // The third argument of its constructor, which is the construct this reads rather than a path: nothing else
      // In the repo passes a third options object carrying `aliases`
      message:
        "Never add `aliases` to a Pulumi resource — the logical name is the Azure name, so an alias cannot spare the replacement a rename causes. See the pulumi-infra skill.",
      selector: "NewExpression > ObjectExpression.arguments:nth-child(3) > Property[key.name='aliases']",
    },
    {
      // Branching on a `Result` by asking which it is leaves one arm to be forgotten and the value to be unwrapped by
      // hand; `.match` takes both arms at once and hands each its own value
      message:
        "`.isOk()`/`.isErr()` are banned — branch with `.match(onOk, onErr)`, throw inside the err handler to rethrow, or fall back with `.unwrapOr(value)`. See the error-handling skill.",
      selector: "CallExpression[callee.property.name=/^(isErr|isOk)$/][arguments.length=0]",
    },
    {
      // A branch is best-effort because the next run repairs it, which is exactly what makes its failure invisible:
      // Nothing is wrong until the repair also stops happening, and by then the first one left no record
      message:
        "`.match(noop, noop)` is a silent swallow — the err handler names what was lost and what it costs (`.match(noop, console.error)` at the least). See the error-handling skill.",
      selector:
        "CallExpression[callee.property.name='match'][arguments.length=2][arguments.0.type='Identifier'][arguments.0.name='noop'][arguments.1.type='Identifier'][arguments.1.name='noop']",
    },
    {
      // `getResult`/`getResultAsync` are the one wrapping, so every Result carries the same `toAppError` mapping; a
      // Direct constructor is a second mapping of its own. The two helpers are its definition sites, and Nuxt's own
      // Configuration, which loads before any workspace package is built, is the one caller that cannot import them
      message:
        "Wrap with `getResult`/`getResultAsync` from `@esposter/shared`, never neverthrow's `fromThrowable`/`fromPromise` directly. See the error-handling skill.",
      selector:
        "CallExpression[callee.name=/^(fromAsyncThrowable|fromPromise|fromThrowable)$/], MemberExpression[object.name=/^(Result|ResultAsync)$/][property.name=/^(fromAsyncThrowable|fromPromise|fromThrowable)$/]",
    },
    {
      // A no-op ok handler is `noop`, so every terminator reads the same. `() => undefined` is matched only where the
      // Match's own value is thrown away or handed straight back: assigned, it is the value the ok arm produces — an
      // `Error | undefined` a caller then tests, which `noop`'s `void` would refuse
      message:
        "The no-op ok handler is `noop` — never an inline `() => {}` or `() => undefined`. See the error-handling skill.",
      selector:
        "CallExpression[callee.property.name='match'] > ArrowFunctionExpression.arguments:first-child[params.length=0][body.type='BlockStatement'][body.body.length=0], :matches(ExpressionStatement, ReturnStatement, ArrowFunctionExpression, ExpressionStatement > AwaitExpression) > CallExpression[callee.property.name='match'] > ArrowFunctionExpression.arguments:first-child[params.length=0][body.type='Identifier'][body.name='undefined']",
    },
  ],
  // Parked, per /docs/architecture/lint-toolchain. A block comment because every line
  // Here opens on a config key, which `//` would capitalize.
  /*
  "@typescript-eslint/naming-convention": [
    "error",
    {
      format: ["camelCase", "PascalCase", "UPPER_CASE"],
      leadingUnderscore: "allow",
      selector: "variable",
      types: ["array", "boolean", "number", "string"],
    },
  ],
  */
};
