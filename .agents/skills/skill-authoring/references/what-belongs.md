# What a skill may record

Read when deciding whether something learned is worth writing down at all, and in what form — the reproducible-pattern test, the placeholders a rule uses, and why a roster is not a rule.

## Is it a reproducible pattern? If not, it does not belong

Before writing anything down, ask whether a reader would apply it **again, to different code**. A skill holds repeatable patterns; git holds what happened.

- **Reproducible** — a rule that fires on a whole class of situations ("a token embedded in authored content is matched on its opening delimiter"). Write it, generically.
- **A one-off** — the specific thing that went wrong once, the file it went wrong in, the fix that was applied. Do **not** write it down at all, and delete it when found. It is not "context worth preserving": the commit, its message and its diff already hold it, in more detail and with a date attached, and a one-off in a skill is read as a standing rule by everyone after you.

The failure mode is subtle because a one-off _feels_ like hard-won knowledge. The test is not "was this expensive to learn" but "will the next reader be in this situation". A war story that generalises should be rewritten as its rule and the story dropped; a war story that doesn't generalise should just go.

This is also why a rule with a live example beats a rule with a historical one: an example lifted from a past change decays into a claim about code that has since moved, which is how a skill starts asserting things that are no longer true.

## Generic placeholders, never identifiers from one change

Code examples use `Foo`/`Bar`/`baz`, `external-pkg`, `@/models/Bar`. **Never paste the concrete identifiers, function names, package names, or file paths from the change that prompted the note** — a skill is a reusable convention, not a changelog, and task-specific names make the rule read as a one-off that doesn't generalise.

Generic source categories (`#shared`, `@vueuse/*`, `@/`) are fine — they describe a class of import, not a specific symbol. A concrete path is fine when the path **is** the rule (a registry file every consumer must edit).

The same applies to numbers: keep only the magnitudes the rule operates on (a limit, a budget), and drop the evidence numbers from the incident that prompted it — PR numbers, dates, counts from one occurrence, quoted error text with baked-in values. If the operative number may drift, state where to re-check it rather than freezing today's reading.

## State the rule, never the roster it produced

The `docs` skill owns this in full ("Never write down what the repo can count", "Magnitudes, not
measurements") and it binds a skill exactly as it binds a page. A count, an enumeration of what currently
satisfies a convention, or an "only X does this" is a second copy of what `ls`, `grep` or a manifest answers,
and it rots without failing anything — the reader who finds one more case than the skill admits cannot tell
whether the skill is stale or the code is wrong. Write the convention that **generates** the set and name where
the set lives; a list earns its place only where every row carries something the tree cannot — a scope, a role,
a caveat.

**A sweep is where this gets broken**, because a pass ends with the swept set freshly in mind and writing it
down reads as completion: "every package now declares X", the roster that opted out, the count reached. It is a
snapshot the next package invalidates, and it is the wrong layer twice over — progress belongs to the sweep's
ledger (the `sweeps` skill), and the rule belongs here as an **invariant plus its enforcer**. What keeps "every
package declares X" true is the test that fails when one does not; the sentence claiming it can only ever go
quietly out of date.
