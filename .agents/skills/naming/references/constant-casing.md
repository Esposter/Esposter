# Constants — casing, and whether to name the value at all

Read when a module-scope binding could be spelled SCREAMING_SNAKE_CASE or PascalCase, or when a literal is
about to be given a name at all. That a fixed scalar is SCREAMING_SNAKE_CASE is `SKILL.md`'s; this page is the
three cases where the casing is contested and the one where the name should not exist.

## A scalar against a lookup table

**A module-scope constant holding a fixed scalar is SCREAMING_SNAKE_CASE** — `MAX_INVITE_ID_RETRIES`,
`SEARCH_SIMILARITY_THRESHOLD`, `DUPLICATE_NAME_SUFFIX`, `CLOSED_SURVEY_ERROR_REASON`. The casing is what separates
the value that is fixed for the life of the process from the local that happens to be `const`, and a camelCase one
reads as the latter at every use site.

A constant holding a **lookup structure** — a map, record or set the code indexes into — is PascalCase named after
its file instead (`file-organization`, `references/constant-maps.md`), because there the name stands for the table
rather than for one value.

**The file is what earns the PascalCase, not the data structure.** A `Set` sharing a `constants.ts` with its
siblings has no file to be named after, so it is a fixed list under the next heading and takes the scalar's
casing — `TEMPORAL_DATE_TYPES`, `OPERATION_PREFIXES`, `ALLOWED_ROOTS`. Read the other way, every membership set in
the repo would be PascalCase and the one-map-per-file rule would have nothing left to mean.

`apps/infra` is the one package this does not reach: a constant there is one per file named after that file,
scalars included, so its casing is the file name's (`pulumi-infra`).

## A fixed list or object that is not a table

**It takes the scalar's casing, not the table's** — `FOO_PROPS`, `FOO_COMMANDS`, `FOO_SHORTCUTS`. PascalCase is earned by being a lookup with a file of its own to be named after; a bound
configuration or an iterated list inside a `<script setup>` has neither, and left camelCase it reads as one more
local among the refs around it.

## A scalar with one reader is inlined, not named

`:height="64"` rather than a `FOO_HEIGHT` above it — the same answer the `vue` skill gives a single-use function.
A name earns its line by being read twice, by compressing a derivation the use site would otherwise spell out, or by
being a list or object in a render position, where a module-scope binding is what stops a fresh allocation every
render. A lone literal bound once is none of those: the name adds a jump and the casing announces a constant nothing
else consults.
