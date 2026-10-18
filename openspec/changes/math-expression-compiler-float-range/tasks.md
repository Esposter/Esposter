## 1. Bernoulli numbers past the float recurrence

- [ ] 1.1 Choose the overflow-free method for indices from 258 up, and record the choice here with its reason. Verify: the choice is written under this task before 1.2 starts.
- [ ] 1.2 Compute Bernoulli numbers by the chosen method, with `OVERFLOW_INDEX` set to the first index whose value is past the float range. Verify: a test named after the scenario "A Bernoulli number at index 258 is finite", written first and seen failing.

## 2. Zeta below the gamma overflow

- [ ] 2.1 Compute the negative branch of zeta from the log of its gamma term, so a finite result is not lost to the gamma's overflow. Verify: a test named after the scenario "Zeta at a negative argument past the gamma overflow is finite", written first and seen failing.

## 3. The nearly-integer snap at large quotients

- [ ] 3.1 Decide whether the snap keeps mathjs's tolerance above a quotient of about 5e11, recording the decision with mathjs's answer at 1e18 modulo 7 where it can be read. Verify: the decision is written under this task before 3.2 starts.
- [ ] 3.2 Apply the decision: bound the snap to quotients a double resolves, or record the case as a `fix` row in the parity snapshot with its cause. Verify: a test named after the scenario "A modulo of a large dividend returns the exact residue", written first and seen failing, or the snapshot row pins the recorded cause.
