## Why

Review #1833 found functions that return a wrong answer over a range of inputs the parity corpus does not reach. Two are open, and each fix changes an algorithm or a tolerance the package is held to, so each needs a decision before code: the parity snapshot records no answer for these ranges, and mathjs, no longer a dependency, answers only from a copy installed outside the workspace.

- `computeZeta` (`packages/math-expression-compiler/src/services/function/computeZeta.ts`): for a non-integer argument between about -262 and -171.35, the negative branch multiplies a finite prefactor by `computeGamma(1 - value)`, which is Infinity once its argument passes 171.35. Zeta returns Infinity where the true value is finite, about 1e212 at -200.5.
- `computeModulo` (`packages/math-expression-compiler/src/services/function/computeModulo.ts`): the nearly-integer snap returns 0 once the quotient's relative tolerance reaches one half, which is above a quotient of about 5e11. `computeModulo(1e18, 7)` returns 0 where the exact residue is 1.

## What Changes

- Compute the negative branch of zeta in log space, from the log of the gamma kernel, so the prefactor and the gamma term combine before they leave the float range.
- Decide whether the nearly-integer snap keeps mathjs's tolerance at large quotients, which is a parity decision: either the snap is bounded to quotients a double can resolve, or the snap is kept and the case is recorded as a known difference in the parity snapshot's `fix` rows with its cause.

No behaviour changes until one of these is decided. Each part adds its parity or unit coverage with the decision.

## Impact

- `packages/math-expression-compiler/src/services/function/computeZeta.ts`
- `packages/math-expression-compiler/src/services/function/computeModulo.ts`
- `packages/math-expression-compiler/src/services/compiler/mathExpressionParity.snapshot.json`
