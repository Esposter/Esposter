# Typed slot ports

The headless core's typed path has three assertions today, and this change removes them. It keeps the core generic and moves the knowledge of each node type into the consumer, where the compiler can check it.

## The bar

A typed path is complete when TypeScript cannot improve it. Concretely:

- No `as` assertion, no `as unknown as`, and no non-null `!` anywhere a value is typed.
- No `Record<string, unknown>`, `object`, `any`, or loose node or document type.
- An `unknown` value is used as typed only after a guard or a schema parse has narrowed it, and every such parse is the boundary where untyped input enters.
- Where TypeScript still cannot type a value, the value is a string or a JSON value that the schema checks at the boundary, and nothing downstream depends on its shape without that check.

Three things stay untyped by nature, and each is confined to a boundary:

1. **A document arriving from a client, an agent or a stored blob** is `unknown` until the document schema parses it.
2. **A JSON Patch path arriving from a client or an agent** is a string until the patch is applied and the result parsed.
3. **A slot name as a JSON key** is a string on the wire. Internally, names are literal types, so only the wire string is untyped.

## Current assertions and why each goes

- **The schema builder.** `buildBlockNodeSchema` assembles a discriminated union from runtime definitions and returns it as the node type by a double assertion. TypeScript cannot prove a union built from runtime values has the compile-time type, so the builder asserts it. The fix is to stop building the union at runtime: each consumer writes its node schemas statically, each satisfying its interface, and the union over them satisfies the union type. TypeScript checks every one of those.
- **The cache.** `createBlockNodeSchema` caches the builder's result per registry and reads it back by assertion. Once the schema is static it is built once at module load, so the cache has nothing to hold and goes with the builder.
- **The slot read.** `getParsedSlotNodes` reads a node's children by a slot name taken from the registry at runtime, which TypeScript cannot correlate with the child type. The fix is the children port, below.

## Decision: the children port

Each consumer has one module, the port, with an exhaustive switch over the node's type tag. Each case returns that type's slots as typed lists:

```ts
// The port's shape, owned by the core as a parameter type
type BlockChildren<TNode extends BlockNode> = (node: TNode) => Readonly<Record<string, readonly TNode[]>>;
```

A consumer's port returns, for a Section, `{ children: node.props.children }`, where `node.props.children` is typed as the child nodes the Section's slot accepts. That is a subtype of the consumer's full node union, so it assigns without an assertion. The switch ends in `exhaustiveGuard`, so adding a node type without a port case fails the typecheck.

The core's walks (the fold that renders a document, the id and count walk, the layer rows, the accepting-slot search, the paste and move services that need a node's children) take `BlockChildren<TNode>` as a parameter. They never look a slot up by a runtime string and then trust the result.

**Rejected: correlating the runtime tag with the props type inside the core.** TypeScript has no way to say that the props of a node whose `type` is a runtime value are the props of that tag, short of an assertion. Keeping the correlation in the core keeps the assertion in the core. The consumer's switch is the one place the correlation is proved, by the compiler, one case at a time.

**Rejected: a single runtime map from tag to definition, indexed by the tag.** A map indexed by a union key returns a union of values, not the value for the tag in hand, so it reintroduces the correlation problem.

## Decision: static node schemas

Each consumer writes, per node type, a schema for its props that satisfies the node's props interface through `satisfies z.ZodType<OwnProps<...>>`, the repo's interface-first rule. Each node's full schema is an object over its props and its type tag, satisfying the node type. Slot children are `z.array(z.lazy(...))` over the schema of the slot's accepted types, and each slot's accepted union is a static `z.discriminatedUnion("type", [...])`. The recursion through `z.lazy` takes an explicit return annotation, since zod needs one to type a recursive lazy.

The consumer's union over every node schema satisfies the consumer's node union type. The core's document schema is then `createBlockDocumentSchema(nodeSchema, rootPropsSchema, maxNodes)`, generic over the consumer's typed schemas, returning the document type with no assertion.

**Rejected: keeping the runtime builder and only moving its assertion.** An assertion is an assertion wherever it sits, and the builder is the one place the compiler could have checked the union.

## Decision: the registry's runtime lists, checked by one test per consumer

The services that move, paste and find accepting slots need each slot's accepted types as strings at runtime, so the registry keeps its `slots` lists. The static schema already states the same facts in types, but TypeScript cannot compare a runtime string list with a schema's type, so the equality is held by a runtime test per consumer: for every slot, the registry's list equals the tags the static schema accepts there.

This is the one fact stated twice in the code, and the test is the only thing that holds the two together. It is kept because the alternative is an assertion, and an assertion is worse than a test that fails loudly.

## Decision: internal pointers built from slot names

Internal JSON Pointers are built by one helper that takes the parent node's pointer and a slot name typed as the node's slot keys. A misspelt slot then fails the typecheck. Pointers arriving from a client or an agent are strings, and they become typed only when the patch is applied and the result parsed, which is the boundary already described.

## Edge cases

- **An empty slot list** is a valid value and produces no children, the same as today.
- **A node type with no slots** has a port case that returns an empty record, so the port is total.
- **A slot whose accepted types are empty** has a static schema of `z.never()`, so a child there is refused by the parse, as today.
- **A document that fails shape validation** reports only the shape refusal. The id and count walk runs only on a clean parse, as today, so the walk can rely on typed children.
- **Recursion depth** is bounded by the node count limit, which the document schema already enforces, so a walk cannot run away on a parsed document.
- **Node limits and id uniqueness** keep their current refusals and messages.

## Tests

Tests follow the testing skill. Type-level assertions live in `.test-d.ts` and are minimal. Runtime tests cover behaviour:

- A type-level test that a port with a missing case fails to compile, as a `@ts-expect-error`, only if the exhaustive guard does not already make that failure visible in the typecheck. The guard usually makes it visible, so the default is no such test.
- One runtime test per consumer: the registry's slot lists equal the static schema's accepted tags.
- The existing parse and refusal tests stay, with their fixtures rebuilt on the static schemas.

## Key files

| File                                                                       | Role                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `packages/headless-block-editor/src/services/buildBlockNodeSchema.ts`      | removed: the runtime builder and its assertion               |
| `packages/headless-block-editor/src/services/createBlockNodeSchema.ts`     | removed: the runtime schema and its cache                    |
| `packages/headless-block-editor/src/services/createBlockNodeBranch.ts`     | removed: the runtime branch builder                          |
| `packages/headless-block-editor/src/services/getParsedSlotNodes.ts`        | removed: the slot read assertion, replaced by the port       |
| `packages/headless-block-editor/src/services/createBlockDocumentSchema.ts` | takes the consumer's typed node schema and root props schema |
| `packages/headless-block-editor/src/services/renderBlockNodes.ts`          | the fold, reading children through the port                  |
| `packages/headless-block-editor/src/models/BlockChildren.ts`               | the port's type, owned by the core                           |
| `apps/web/shared/services/pageBuilder/webpageNodeChildren.ts`              | the webpage port, one exhaustive switch                      |
| `apps/web/shared/services/pageBuilder/webpageNodeSchema.ts`                | the webpage node union schema, statically built              |
| `packages/mjml-blocks/src/services/mjmlNodeChildren.ts`                    | the email port, one exhaustive switch                        |
| `packages/mjml-blocks/src/services/mjmlNodeSchema.ts`                      | the email node union schema, statically built                |
