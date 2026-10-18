## Why

The parser builds its binary and unary nodes from names it restates in the rule files. The implicit product and the divided product write `multiply` and `divide` as literals, where every other operator level reads them from `MathExpressionOperatorMap` and builds them with `createBinaryNode`. The factorial name `factorial` is written once in `parseLeftHand` and again in `checkIsOperatorOperand`, so one name lives in two files.

Reading the map's `*` and `/` entries is not a direct lookup: under `noUncheckedIndexedAccess` the map's record type yields `string | undefined`, so routing those two rules through `createBinaryNode` needs a typing choice first.

## What Changes

- The implicit product and the divided product read their function names from `MathExpressionOperatorMap[MathExpressionGrammarRule.Multiplicative]` and build their nodes with `createBinaryNode`.
- The factorial name is written in one place that both `parseLeftHand` and `checkIsOperatorOperand` import.

No behaviour changes. No spec delta: this is a refactor of the parser's internals, so `skip_specs` is set.

## Impact

- `packages/math-expression-compiler/src/services/parser/rule/parseImplicitProduct.ts`
- `packages/math-expression-compiler/src/services/parser/rule/parseDivisionBeforeProduct.ts`
- `packages/math-expression-compiler/src/services/parser/MathExpressionOperatorMap.ts`
- `packages/math-expression-compiler/src/services/parser/rule/parseLeftHand.ts`
- `packages/math-expression-compiler/src/services/parser/checkIsOperatorOperand.ts`
