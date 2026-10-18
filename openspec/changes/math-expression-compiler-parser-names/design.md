## Context

`MathExpressionOperatorMap` types each level as `Readonly<Record<string, T>>`, and `getMathExpressionOperator` returns `T | undefined`, so every rule that reads an operator handles the absent case. `parseLeftAssociative` and `parsePower` read their operators that way. The implicit product and the divided product know their operator is present, but the map's record type cannot say so.

## Decision: how a fixed operator name is read

Options considered:

1. **Assert the entry is present** (`map["*"]!`). Rejected: it trades the compiler's check for a claim the map's type does not make, and a renamed key would then fail at run time rather than at the read.
2. **A throwing lookup** that returns the name or throws when the key is absent. Rejected: a throw in the parser's hot path for a key the module itself defines, and a second helper beside `getMathExpressionOperator` for one caller pair.
3. **Retype the operator map with literal keys**, so that a read of `"*"` is typed `"multiply"` and needs no check. Chosen, subject to the map still satisfying `parseLeftAssociative`'s generic `Readonly<Record<string, T>>` parameter, which must be checked when the change is built.
4. **Keep the literals and pass them to `createBinaryNode`.** Rejected: it removes the object literal but leaves the name restated in the rule file, which is the defect the finding names.

## Decision: where a factorial's name lives

`parseLeftHand` builds the node and `checkIsOperatorOperand` tests it. Both should import one name. Node function names are plain strings across the package (`unaryMinus`, `bitNot`, `factorial`, `ctranspose`, and the operator map's values), so the factorial name is decided together with the rest, not alone: a constant for `factorial` only would leave the unary names restated beside it. The build decides that set once, in the change's tasks.
