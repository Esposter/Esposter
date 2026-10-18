## Why

Review #1833 found three functions that return a wrong answer over a range of inputs the parity corpus does not reach. Each fix changes an algorithm or a tolerance the package is held to, so each needs a decision before code: the parity snapshot stops at `bernoulli(172)` and records no answer for these ranges, and mathjs is not installed here to confirm what it returns.

- `computeBernoulliNumber` (`packages/math-expression-compiler/src/services/function/computeBernoulliNumber.ts`): the float recurrence sums terms that overflow before the Bernoulli number itself does. Index 258 returns NaN, though its value is about 1.3e306 and finite, and the file's own overflow threshold of 260 is where the value first leaves the float range.
- `computeZeta` (`packages/math-expression-compiler/src/services/function/computeZeta.ts`): for a non-integer argument between about -262 and -171.35, the negative branch multiplies a finite prefactor by `computeGamma(1 - value)`, which is Infinity once its argument passes 171.35. Zeta returns Infinity where the true value is finite, about 1e212 at -200.5.
- `computeModulo` (`packages/math-expression-compiler/src/services/function/computeModulo.ts`): the nearly-integer snap returns 0 once the quotient's relative tolerance reaches one half, which is above a quotient of about 5e11. `computeModulo(1e18, 7)` returns 0 where the exact residue is 1.

## What Changes

- Choose an overflow-free method for Bernoulli numbers from index 258: a scaled recurrence, or the terms taken in log space. Its cutoff replaces `OVERFLOW_INDEX` only if the chosen method stops being finite at a different index.
- Compute the negative branch of zeta in log space, from the log of the gamma kernel, so the prefactor and the gamma term combine before they leave the float range.
- Decide whether the nearly-integer snap keeps mathjs's tolerance at large quotients, which is a parity decision: either the snap is bounded to quotients a double can resolve, or the snap is kept and the case is recorded as a known difference in the parity snapshot's `fix` rows with its cause.

No behaviour changes until one of these is decided. Each part adds its parity or unit coverage with the decision.

## Impact

- `packages/math-expression-compiler/src/services/function/computeBernoulliNumber.ts`
- `packages/math-expression-compiler/src/services/function/computeZeta.ts`
- `packages/math-expression-compiler/src/services/function/computeModulo.ts`
- `packages/math-expression-compiler/src/services/compiler/mathExpressionParity.snapshot.json`
