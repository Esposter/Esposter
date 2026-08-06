# Enums — Declaration, Values Arrays, Refs

## Naming

**Never abbreviate enum value names** — full word: `Absolute` not `Abs`, `Subtract` not `Sub`, `Configuration` not `Config`. Applies to both key and string value.

## No `None`/sentinel member for "absent"

An enum lists only _real_ variants. Represent "nothing selected / no preset" as an **optional, omitted field** (`environment?: Environment`), not a fake `Environment.None` — absence is the missing key. Resolvers accept `Environment | undefined` and guard `if (!environment)`; config schemas use `z.enum(E).optional()`, not `.default(E.None)`; generators/CLI pickers omit the key rather than writing a `none` value. Never `?? SomeEnum.None`.

Keep a sentinel member only when that value is a genuinely distinct, selectable state the domain acts on (rare) — not merely "not chosen".

## Extension via `mergeObjectsStrict`

When a large enum has a meaningful "base" subset handled separately, split it:

1. Declare **named sub-groups used independently** as exported enums in their own files (e.g. `BasicStringTransformationType.ts`).
2. Declare **unlabelled/catch-all values** (e.g. `Interpolate`) as an **unexported `enum BaseXxxType`** inside the merged type's file — never a separate file.
3. Merge with `mergeObjectsStrict` from `@esposter/shared`; export the union type using enum type names.

```ts
// BasicStringTransformationType.ts (exported — sub-functions accept this for exhaustive switch)
export enum BasicStringTransformationType {
  LowerCase = "LowerCase",
  TitleCase = "TitleCase",
  Trim = "Trim",
  UpperCase = "UpperCase",
}
export const basicStringTransformationTypeSchema = z.enum(
  BasicStringTransformationType,
) satisfies z.ZodType<BasicStringTransformationType>;

// StringTransformationType.ts (the merged full type)
enum BaseStringTransformationType {
  // NOT exported — internal only
  Interpolate = "Interpolate",
}
export const StringTransformationType = mergeObjectsStrict(BasicStringTransformationType, BaseStringTransformationType);
export type StringTransformationType = BasicStringTransformationType | BaseStringTransformationType;
export const stringTransformationTypeSchema = z.enum(
  StringTransformationType,
) satisfies z.ZodType<StringTransformationType>;
```

**Why**: functions like `computeStringTransformation` accept `BasicStringTransformationType` so their `switch` stays exhaustive (TypeScript verifies all cases; `default: exhaustiveGuard` is truly unreachable). `mergeObjectsStrict` makes `StringTransformationType.LowerCase`/`.Interpolate` work identically to a plain enum at call sites. Keeping the catch-all unexported and co-located avoids polluting exports.

## Values array

- **Export a pluralized values collection from the enum file only when it's actually used** — at the bottom, after the Zod schema. Never pre-emptively: an export with zero call sites is dead code.
- **Plain `Object.values` array by default, `new Set` only when Set functionality is genuinely used** — enum values are unique by construction, so a Set adds nothing for iteration and forces `[...EnumNames]` spreads at every array call site (`v-for`, `.map`, `.filter`, `.join` all want arrays). Reach for a Set only when call sites actually use `.has()`/`.difference()`, or the source can contain duplicates (e.g. `ContentTypes` dedupes mime-type values):

  ```ts
  // Default — plain array; iterate, map, filter, join directly with no spreads
  export const PostSortTypes = Object.values(PostSortType);

  // Set — earned by real membership checks at the call sites
  export const NumberFormats: ReadonlySet<NumberFormat> = new Set(Object.values(NumberFormat));
  NumberFormats.has(format); // O(1)
  ```

  In published packages (`db-schema` etc., isolatedDeclarations) annotate the array explicitly: `export const MessageTypes: readonly MessageType[] = Object.values(MessageType);`. In the app, let it infer.

- **Never write `Object.values(SomeEnum)` inline** — use the exported array.
- **The values array lives in the source's own file, never at a consumption site** — a `const FooTypes = Object.values(FooType)` declared locally in a service/component (or duplicated across two consumers) is the violation shape even when typed and named correctly; move it to the enum's file and import it. Same rule for map-derived collections: `export const FooDefinitions = Object.values(FooDefinitionMap)` sits at the bottom of the map's file. Exception: test files may derive values locally when the point of the test is independently re-deriving them (e.g. exhaustiveness assertions against a map).

## Enum refs

- **Never `ref<EnumType | null>(null)`** — default to a sensible first value: `ref(DataSourceType.Csv)`, `ref(ColumnType.String)`.
- **Never `ref<EnumType>(EnumValue)`** — TypeScript infers the type from the value: `ref(ColumnType.String)`.
- **Filter/selection refs where "nothing selected" is a real state** use the string-enum `""` sentinel — `ref<"" | EnumType>("")` — never `| null` or `| undefined`. Pair with an explicit "All …" select item (`value: ""`), never `clearable` (see the `vuetify` skill).
- **Prefer inferred refs** — `ref("")`, `ref(0)`, `ref(EnumType.Value)`. Annotate only when the value space genuinely exceeds the seed: `ref<"" | EnumType>("")`, literal-union inputs like `ref<CreateInviteInput["maxUses"]>(0)`.
