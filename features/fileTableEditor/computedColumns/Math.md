# Math Transformation — Expression-Based Overhaul

## Motivation

The previous `first + steps[]` fold model required users to manually chain unary/binary step objects. It could not express operator precedence without nesting, was verbose for simple expressions, and required building and maintaining custom AST-walking code.

The replacement uses a **math expression library** that handles parsing, precedence, grouping, and evaluation. Users write a plain expression string; column values are bound as named variables.

---

## Library Choice: mathjs

**mathjs** is the recommended library:

- **Browser-compatible** — ships an ESM build, works with Vite/Rolldown without extra config.
- **Tree-shakeable** — import only `evaluate` and `parse` from `"mathjs"` to keep bundle size small. The expression parser alone is ~30 KB min+gz.
- **Variable substitution** — `evaluate("a + b * 2", { a: 5, b: 3 })` returns `11`.
- **Parse-time validation** — `parse("a +")` throws with a descriptive message (`"Unexpected end of expression"`), enabling the exact error text to be surfaced in the error icon.
- **Operator support** — `+`, `-`, `*`, `/`, `^` (power), `%` (mod), unary `-`, comparison operators, built-in functions (`abs`, `round`, `floor`, `ceil`, `sqrt`, `log`, etc.).

Install: add `mathjs` to `packages/app` dependencies.

---

## New Shape

```typescript
interface MathTransformation extends ItemEntityType<ColumnTransformationType.Math> {
  expression: string;
  variables: { name: string; sourceColumnId: string }[];
}
```

- **`expression`** — a mathjs expression string referencing auto-generated variable names, e.g. `"col0 * (col1 + col2)"`.
- **`variables`** — ordered list binding each `colN` name to a source column ID.

### Variable naming convention

Variables are always auto-generated as `col0`, `col1`, `col2`, … These are valid mathjs identifiers, never conflict with any mathjs built-in (which are all lowercase words like `abs`, `sin`), and are visually distinct from user-typed constants. Users never type variable names manually — they always insert them via the UI.

Example:

```json
{
  "type": "Math",
  "expression": "col0 * (1 - col1)",
  "variables": [
    { "name": "col0", "sourceColumnId": "col-id-price" },
    { "name": "col1", "sourceColumnId": "col-id-discount" }
  ]
}
```

---

## Evaluation

```typescript
import { evaluate } from "mathjs";

const scope = Object.fromEntries(
  transformation.variables.map(({ name, sourceColumnId }) => [name, Number(computeSource(sourceColumnId)) ?? 0]),
);
const result = evaluate(transformation.expression, scope);
return typeof result === "number" && isFinite(result) ? result : null;
```

`null` source values are coerced to `0` for numeric evaluation. Non-finite results (`Infinity`, `NaN`) return `null`.

---

## Validation (Zod `.refine()`) + Error Icon propagation

`parse()` throws with a descriptive message. Capture it in the `.refine()` message factory so it flows through `schema.safeParse()` → `z.prettifyError()` → the error icon:

```typescript
.superRefine(({ expression }, ctx) => {
  try {
    parse(expression);
  } catch (error) {
    ctx.addIssue({
      code: "custom",
      message: error instanceof Error ? error.message : "Invalid expression",
      path: ["expression"],
    });
  }
})
```

This means a user who types `col0 +` sees the exact mathjs error `"Unexpected end of expression"` in the error icon — no custom error string needed.

---

## UI (vjsf)

The form has two fields:

1. **Expression** — `z.string()` plain text input. Users do not type variable names by hand; they use an "Insert Column" button (rendered outside vjsf or as a custom `comp`) that appends `col0`, `col1`, etc. at the cursor. The next variable name to insert is always `col${variables.length}` before the new variable is added. Expression syntax errors surface live via the error icon.

2. **Variables** — `z.array(...)` of `{ name, sourceColumnId }`. Rendered as an ordered list; each row shows the auto-generated name (`col0`, `col1`, …) as a read-only label and a `sourceColumnId` column selector restricted to `context.numberColumnItems`. Adding a variable appends `{ name: "colN", sourceColumnId: "" }` and inserts `colN` into the expression at the cursor. Removing a variable is not supported after insertion (the name stays in the expression); reordering is also not needed since names are stable.

---

## Files to Remove

Once implemented, delete all of:

- `shared/models/tableEditor/file/column/transformation/BinaryMathOperationType.ts`
- `shared/models/tableEditor/file/column/transformation/BinaryMathStep.ts`
- `shared/models/tableEditor/file/column/transformation/UnaryMathOperationType.ts`
- `shared/models/tableEditor/file/column/transformation/UnaryMathStep.ts`
- `shared/models/tableEditor/file/column/transformation/MathStep.ts`
- `shared/models/tableEditor/file/column/transformation/MathStepType.ts`
- `shared/models/tableEditor/file/column/transformation/MathOperand.ts`
- `shared/models/tableEditor/file/column/transformation/MathOperandType.ts`
- `shared/models/tableEditor/file/column/transformation/ColumnMathOperand.ts`
- `shared/models/tableEditor/file/column/transformation/ConstantMathOperand.ts`
- `app/services/tableEditor/file/column/transformation/computeMathTransformation.ts` (and its test)

And rewrite `MathTransformation.ts` to just the new shape.

---

## Migration

No migration needed — not deployed to production. Delete the old shape outright and implement the new architecture clean.
