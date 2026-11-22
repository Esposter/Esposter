# Security

## Areas

The areas and their units are the shared [area list](../areas/), and `pnpm ai:sweep:status security` says where each unit stands. It keeps an area file only for the units it holds a note on: [tooling](tooling.md).md) and [tooling](tooling.md). A pass loads this file, the `security` skill's checklist
(`.agents/skills/security/references/owasp-top-10.md`), the register of verified boundaries
(`openspec/specs/architecture/security/README.md`) and the area's file in the list. A flow the register
already answers is cited from its row rather than read again.

Unlike most sweeps, a finding here usually changes behaviour: it closes a hole. Each one is fixed in its own commit
with its regression test, apart from the unit's `Ledger:` trailer commit, so reverting a fix never reopens the
coverage. An accepted risk its owning page already records is not a finding.

## Find recipe

The checklist is read, not grepped, but these sinks are where a unit's reading starts. Each hit is checked against
the checklist row it belongs to, and a hit that proves safe is not a finding. The recipe was run against the tree
when the ledger was opened and returns hits, so an empty result for a unit means the unit has none of these sinks.

```sh
git grep -n -E "v-html|innerHTML|sql\.raw\(|Math\.random\(|execSync\(|execFileSync\(|spawn\(|new Function\(|eval\(|process\.argv" -- <unit> ':!*.test.ts'
```

Procedures and routes are read in full whatever the grep finds, since a missing guard leaves no string to match.

## Exclusions

Excluded: `CHANGELOG.md` (lerna output).
