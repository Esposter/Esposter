# Prompts

Read when the user asks to run, rerun or resume a product review.

## Starting a pass

The user's ask names an area, or all of them. Either way the session runs the loop in `SKILL.md` one area at a time, and opens each area by stating, in its first message:

- the area and the reference product it will be judged against, with the help pages it will read;
- the open proposals it will verify;
- the deferred and rejected pages it has read, so the user can see what will not be re-proposed.

An ask for "all products" is taken area by area in the order the user gives, else by the rule in `SKILL.md`; the session reports after each area rather than once at the end, so a long review is useful before it finishes.

## The questions

Every surface is asked the questions in `references/gap-inventory.md` ("The questions every surface is asked"), in that order, and each is answered in the report — "nothing" is an answer.

## The report

One table per area, one row per finding, each with the bucket it went to and a link to the page or commit that holds it:

| Finding | Bucket (fix · proposal · deferred · rejected · holds) | Where |
| ------- | ----------------------------------------------------- | ----- |

Then the churn line from `references/convergence.md`, and — if the area converged — that sentence alone.
