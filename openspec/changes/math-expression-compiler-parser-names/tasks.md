## 1. Parser names

- [ ] 1.1 Retype `MathExpressionOperatorMap` with literal keys as the design's option 3 says, and confirm `parseLeftAssociative` and `getOwnValue` still take it. Verify: `pnpm typecheck` in `packages/math-expression-compiler` passes, and `pnpm test src/services/compiler --run` passes unchanged.
- [ ] 1.2 Build the implicit product and the divided product with `createBinaryNode`, reading `"*"` and `"/"` from the map. Verify: `pnpm test src/services/compiler --run` passes, including the parity snapshot's implicit-product entries.
- [ ] 1.3 Name the factorial and the unary names once, in the decision the design records, and point `parseLeftHand` and `checkIsOperatorOperand` at it. Verify: `grep -rn '"factorial"' src/services/parser` finds one literal, and the compiler suite passes.
