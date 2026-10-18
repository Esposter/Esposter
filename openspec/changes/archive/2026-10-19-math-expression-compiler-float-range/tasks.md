## 1. Zeta below the gamma overflow

- [x] 1.1 Compute the negative branch of zeta from the log of its gamma term, so a finite result is not lost to the gamma's overflow. Verify: the parity rows `zeta(-200.5)` and `zeta(-190.5)` pass, with the cause "mathjs's zeta is infinite at a negative argument past the gamma overflow, where the value is finite". The rows were written after the change, not first, as the [design](design.md) records; the first version of the branch failed them on a missing sine factor.

## 2. The nearly-integer snap at large quotients

- [x] 2.1 Decide whether the snap keeps mathjs's tolerance above a quotient of about 5e11, recording the decision with mathjs's answer at 1e18 modulo 7 where it can be read. Verify: the decision is written in the [design](design.md), with mathjs's answer `0` for `mod(1e18, 7)` read from mathjs 15.2.
- [x] 2.2 Apply the decision: bound the snap to quotients a double resolves, and take the exact residue of two integers. Verify: the parity row `mod(1e18, 7)` with the cause "mathjs's modulo snaps a quotient past 5e11 to zero, so the residue of a large dividend is lost" passes, and the parity suite passes in full.
