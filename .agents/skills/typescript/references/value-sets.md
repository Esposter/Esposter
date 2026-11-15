# Value Sets — Declaration, Values Arrays, Refs

Read when declaring a closed set of named values, its Zod schema, its values array, or a ref that holds one — and when
an inline union of string literals could be one instead.

## The one form

A set is an `as const` object with a type of the same name, in its own model file:

```ts
export const ThemeMode = { Dark: "dark", Light: "light", System: "system" } as const;
export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];
export const themeModeSchema = z.enum(ThemeMode) satisfies z.ZodType<ThemeMode>;
```

It is plain JavaScript with a type on top, so every runtime loads it — Node's type stripping, a bare-`node` plugin, the
Nuxt configuration, a tsdown config reaching its own source. `erasableSyntaxOnly` is on in every tsconfig, so an `enum`
does not compile, and there is no second form and no list of places that need this one.

- **A member used as a type is `typeof` the member** — `type: typeof SurveyNodeType.Text`,
  `Exclude<ColumnType, typeof ColumnType.Computed>`. The set's own name is the union of its values.
- **A member is PascalCase; its value keeps the outside spelling** — `Dark: "dark"`, and lint refuses any other key
  casing (the `naming` skill, `references/value-set-members.md`).
- **A plain literal assigns to the set** — `"dark"` is a `ThemeMode`, which the value-sets design accepts
  (`openspec/specs/architecture/value-sets/design.md`).
- **A generic seeded with one member names the set** — `useDataMap<DataSourceType>(…)`, since a member alone infers
  its own literal.

## Naming

**Never abbreviate a member** — full word: `Absolute` not `Abs`, `Subtract` not `Sub`, `Configuration` not `Config`.
Applies to both key and value.

## No `None`/sentinel member for "absent"

A set lists only _real_ variants. Represent "nothing selected / no preset" as an **optional, omitted field**
(`environment?: Environment`), not a fake `Environment.None` — absence is the missing key. Resolvers accept
`Environment | undefined` and guard `if (!environment)`; config schemas use `z.enum(E).optional()`, not
`.default(E.None)`; generators/CLI pickers omit the key rather than writing a `none` value. Never `?? SomeSet.None`.

Keep a sentinel member only when that value is a genuinely distinct, selectable state the domain acts on (rare) — not
merely "not chosen".

## Extension via `mergeObjectsStrict`

When a large set has a meaningful "base" subset handled separately, split it:

1. Declare **named sub-groups used independently** as exported sets in their own files (e.g. `BasicFooType.ts`).
2. Declare **unlabelled/catch-all values** (e.g. `Qux`) as an **unexported `BaseXxxType`** inside the merged set's
   file — never a separate file.
3. Merge with `mergeObjectsStrict` from `@esposter/shared`, never object spread. The merge refuses a key any two of its
   sets share: the merged type is `never`, and the merge throws when its module loads.

```ts
// BasicFooType.ts (exported — sub-functions accept this for exhaustive switch)
export const BasicFooType = { Bar: "Bar", Baz: "Baz" } as const;
export type BasicFooType = (typeof BasicFooType)[keyof typeof BasicFooType];
export const basicFooTypeSchema = z.enum(BasicFooType) satisfies z.ZodType<BasicFooType>;

// FooType.ts (the merged full set)
const BaseFooType = { Qux: "Qux" } as const;
type BaseFooType = (typeof BaseFooType)[keyof typeof BaseFooType];
export const FooType = mergeObjectsStrict(BasicFooType, BaseFooType);
export type FooType = BasicFooType | BaseFooType;
export const fooTypeSchema = z.enum(FooType) satisfies z.ZodType<FooType>;
```

**Why**: functions like `computeFoo` accept `BasicFooType` so their `switch` stays exhaustive (TypeScript verifies all
cases; `default: exhaustiveGuard` is truly unreachable). `FooType.Bar` and `FooType.Qux` read the same at every call
site. Keeping the catch-all unexported and co-located avoids polluting exports.

A set that mirrors data the repository does not author — a bucket's file names, a Tiled project's property types — is
written by the generator that reads that data (`createValueSetString`), never merged from hand-written subsets.

## Values array

- **Export a pluralized values collection from the set's file only when it's actually used** — at the bottom, after the
  Zod schema. Never pre-emptively: an export with zero call sites is dead code.
- **Plain `Object.values` array by default, `new Set` only when Set functionality is genuinely used** — a set's values
  are unique by construction, so a `Set` adds nothing for iteration and forces `[...FooTypes]` spreads at every array
  call site (`v-for`, `.map`, `.filter`, `.join` all want arrays). Reach for a `Set` only when call sites actually use
  `.has()`/`.difference()`, or the source can contain duplicates (e.g. a list of mime-type values, where several entries
  share one value):

  ```ts
  // Default — plain array; iterate, map, filter, join directly with no spreads
  export const FooTypes = Object.values(FooType);

  // Set — earned by real membership checks at the call sites
  export const BarTypes: ReadonlySet<BarType> = new Set(Object.values(BarType));
  BarTypes.has(barType); // O(1)
  ```

  In published packages (packages whose declarations are emitted, i.e. with `isolatedDeclarations` on, e.g.
  `packages/shared` and `packages/parse-tmx`) annotate the array explicitly:
  `export const FooTypes: readonly FooType[] = Object.values(FooType);`. In the app, let it infer.

- **Never write `Object.values(SomeSet)` inline** — use the exported array.
- **The values array lives in the set's own file, never at a consumption site** — a
  `const FooTypes = Object.values(FooType)` declared locally in a service/component (or duplicated across two consumers)
  is the violation shape even when typed and named correctly; move it to the set's file and import it. Same rule for
  map-derived collections: `export const FooDefinitions = Object.values(FooDefinitionMap)` sits at the bottom of the
  map's file. Exception: test files may derive values locally when the point of the test is independently re-deriving
  them (e.g. exhaustiveness assertions against a map).

## Refs holding a member

- **Never `ref<FooType | null>(null)`** — default to a sensible first value: `ref<FooType>(FooType.Bar)`.
- **A ref seeded with one member names its set** — `ref<FooType>(FooType.Bar)`, since `ref(FooType.Bar)` infers the one
  literal and refuses every other member.
- **Filter/selection refs where "nothing selected" is a real state** use the `""` sentinel — `ref<"" | FooType>("")` —
  never `| null` or `| undefined`. Pair with an explicit "All …" select item (`value: ""`), never a clear control that
  empties the select to `undefined`.
- **Prefer inferred refs otherwise** — `ref("")`, `ref(0)`. Annotate only when the value space genuinely exceeds the
  seed: `ref<"" | FooType>("")`, literal-union inputs like `ref<CreateFooInput["baz"]>(0)`.

## A union of string literals is one of these

`"delete" | "get"` in an annotation is a closed set spelled inline, so it becomes the value set `HttpMethod` in its own
model file and the annotation names it. These unions are **not** sets: `"" | Foo` (the empty sentinel), a lone
discriminant (`type: "ApiConnection"`), a numeric union, and a union passed as a type argument (`Pick<Foo, "a" | "b">`
names keys).

`literal-union/no-string-literal-union` (`scripts/src/oxlint/literalUnion.ts`) enforces it repo-wide, except in
declaration files.
