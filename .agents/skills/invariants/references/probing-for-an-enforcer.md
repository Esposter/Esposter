# Probing for an Enforcer Before Writing a Rule

Read before writing a convention into a skill, to find out whether a lint rule already decides it or a selector could.

Before a convention is written into a skill, find out whether something already decides it — oxlint ships ~500
rules and the repo enables a broad plugin set with every category at `error`, so a surprising share of what reads like a
review convention is already a build failure. Probe rather than assume: a throwaway file in the tree, run
`pnpm exec oxlint --format=default --disable-nested-config <path>`, and read what fires.

Both answers are worth having. If it fires, the skill line shrinks to the rule's name and stops being a second
source of truth that can drift from the build. If it does not, the question becomes whether a selector could —
and a `no-restricted-syntax` entry with a message is a better home for the rule than a bullet nobody re-reads.

The line a skill keeps either way is the part no rule can state: **why**, and which shapes are the exceptions.
A disable comment then has something to name.
