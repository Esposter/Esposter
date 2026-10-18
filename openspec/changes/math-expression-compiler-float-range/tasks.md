## 1. Zeta below the gamma overflow

- [ ] 1.1 Compute the negative branch of zeta from the log of its gamma term, so a finite result is not lost to the gamma's overflow. Verify: a test named after the scenario "Zeta at a negative argument past the gamma overflow is finite", written first and seen failing.

## 2. The nearly-integer snap at large quotients

- [ ] 2.1 Decide whether the snap keeps mathjs's tolerance above a quotient of about 5e11, recording the decision with mathjs's answer at 1e18 modulo 7 where it can be read. Verify: the decision is written under this task before 2.2 starts.
- [ ] 2.2 Apply the decision: bound the snap to quotients a double resolves, or record the case as a `fix` row in the parity snapshot with its cause. Verify: a test named after the scenario "A modulo of a large dividend returns the exact residue", written first and seen failing, or the snapshot row pins the recorded cause.
