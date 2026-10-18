## Context

Review #1833 found two functions that answer wrongly over ranges the parity corpus does not reach. Both are held to mathjs's answers by the [language design](../../specs/math-expression-compiler/language/design.md), so each fix is a recorded difference in the parity snapshot, with its cause, and a scenario in the [language spec](../../specs/math-expression-compiler/language/spec.md).

## Decision: zeta's negative branch is multiplied as logs past the gamma overflow

The functional equation multiplies a prefactor `2^s * pi^(s-1) * sin(pi s / 2)` by `Gamma(1 - s) * zeta(1 - s)`. For `1 - s` above `OVERFLOW_ARGUMENT`, the gamma term is infinite while the prefactor is finite, so the product is infinite where the value is finite: about `-2.3e215` at `s = -200.5`.

Options considered:

1. **Log space for every negative argument.** Rejected. It changes the last bits of the zeta fix rows at `-1`, `-3` and `-5`, which are exact-match entries, so the parity record would need every one of them moved to a tolerance for no gain in range.
2. **Log space past the gamma overflow only.** Chosen. Below the overflow the existing product is kept, so every exact entry holds. Past it the log of each factor is summed, the sign is the sine's, and `exp` gives the magnitude, which overflows to an infinity exactly where the true value does.

## Decision: the nearly-integer snap is bounded, and the residue is exact for two integers

The snap compares the quotient with its rounding within a relative tolerance of `1e-12`. The tolerance reaches half a unit at a quotient of `5e11`, so past it every quotient would count as a whole multiple, and `mod(1e18, 7)` is `0` where the residue is `1`.

Options considered:

1. **Bound the snap and keep the floored formula past `5e11`.** Rejected alone. For `1e18` modulo `7` the floored formula gives `64`, because the quotient is not representable, so the answer stays wrong.
2. **Record the case as a `fix` row and keep mathjs's snap.** Rejected alone. The row pins a wrong answer, and the exact residue of two integers is cheap to compute.
3. **Bound the snap, take the residue of two integers exactly with `BigInt`, and keep the snap for other operands.** Chosen. Below `5e11` mathjs's snap is kept, so every existing entry holds. Above it, two integers take `BigInt` remainder, moved to the divisor's sign where the two differ, and a non-integer keeps the snap. Past the bound a double quotient cannot hold the fraction, and the floored formula was wrong by whole units there: the review found `mod(1e17, 0.3)` at `-16`, outside the divisor's range, where HEAD gave `0`.

The `1e18` case is pinned by a `fix` row in the parity snapshot, whose recorded value is mathjs's `0` and whose fix value is `1`.

## Test-first

The tasks ask for each scenario's test to be written first and seen failing. The zeta and modulo fix rows were written after the change, not before it. The zeta row did fail once, against a missing sine factor in the first version of the log branch, so the rows do test the answer.

## Key files

Every path starts at the repository root.

| File                                                                                         | Role                                                                      |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `packages/math-expression-compiler/src/services/function/computeZeta.ts`                     | The negative branch: the product, or past the overflow the logs           |
| `packages/math-expression-compiler/src/services/function/computeModulo.ts`                   | The snap below the bound, and the exact residue of two integers above it  |
| `packages/math-expression-compiler/src/services/function/constants.ts`                       | `MAXIMUM_SNAP_QUOTIENT`, where the relative tolerance reaches half a unit |
| `packages/math-expression-compiler/src/services/compiler/mathExpressionParity.snapshot.json` | The `fix` rows: `zeta(-200.5)`, `zeta(-190.5)` and `mod(1e18, 7)`         |
