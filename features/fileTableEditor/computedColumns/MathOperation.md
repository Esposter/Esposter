# MathOperation Transformation

## Design Rationale

The naive split into `UnaryMathOperation` and `BinaryMathOperation` as two separate `ColumnTransformationType` values breaks composition: `Abs(Price * Quantity)` would require two chained computed columns just to apply a unary op to the result of a binary one.

Instead, `MathOperation` stays as a single transformation type whose internal structure is a composable fold-left sequence. Unary and binary ops are step variants within that sequence — they compose freely in any order.

---

## Shape

Does **not** extend `WithSourceColumnId`. Sources are embedded in `first` and binary step operands.

```typescript
{ type: MathOperation, first: MathOperand, steps: MathStep[] }

type MathOperand =
  | { type: 'column',   sourceColumnId: string }
  | { type: 'constant', value: number }

type MathStep =
  | { type: 'unary',  operation: UnaryMathOperationType }
  | { type: 'binary', operation: BinaryMathOperationType, operand: MathOperand }

enum UnaryMathOperationType  { Abs, Round, Floor, Ceil }
enum BinaryMathOperationType { Add, Subtract, Multiply, Divide }
```

---

## Evaluation

Start with `first`, fold left over `steps`:

```
result = resolve(first)
for each step:
  unary  → result = step.operation(result)
  binary → result = step.operation(result, resolve(step.operand))
```

`resolve` looks up a column value via `resolveValue` (supports chained computed columns) or returns the constant directly.

---

## Examples

| Expression              | `first`      | `steps`                                           |
| ----------------------- | ------------ | ------------------------------------------------- |
| `Abs(Price)`            | `col(price)` | `[unary(Abs)]`                                    |
| `Price * 2`             | `col(price)` | `[binary(Multiply, const(2))]`                    |
| `Price * Quantity`      | `col(price)` | `[binary(Multiply, col(quantity))]`               |
| `Abs(Price * Quantity)` | `col(price)` | `[binary(Multiply, col(quantity)), unary(Abs)]`   |
| `Round(Price * 0.9)`    | `col(price)` | `[binary(Multiply, const(0.9)), unary(Round)]`    |
| `(A + B) * C`           | `col(A)`     | `[binary(Add, col(B)), binary(Multiply, col(C))]` |

---

## Structural Validation

`steps` is self-validating — each step carries its own operand. It is structurally impossible to have a mismatched count. No `.refine()` needed.

---

## Migration from v2

The v2 flat shape `{ sourceColumnId, operation, operand? }` maps directly:

- Unary (`Abs`, `Round`, `Floor`, `Ceil`) → `{ first: col(sourceColumnId), steps: [unary(operation)] }`
- Binary with constant → `{ first: col(sourceColumnId), steps: [binary(operation, const(operand))] }`

---

## UI

The form renders `first` as a column/constant selector, then a dynamic list of steps. Each step row shows:

- A step-type toggle (unary / binary)
- Unary: operation dropdown only
- Binary: operation dropdown + column-or-constant selector

Adding a step appends a new row. Removing a step removes its row. No separate operation and operand arrays to keep in sync.
