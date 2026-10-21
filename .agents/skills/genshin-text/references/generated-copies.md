# Generated copies

Read when a file under `src/generated` is written, or a module the persona copies is changed.

The one-line rule is in `SKILL.md`; this page is its reasoning.

Its output is never formatted (`oxfmt.config.ts` ignores `**/generated/**`), and `scripts/src/services/genshinText/getPersonaModuleSource.test.ts` fails the day the persona's copy and its source disagree, so a change to a copied module is followed by a `write`.
