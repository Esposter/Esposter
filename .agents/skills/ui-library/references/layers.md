# Layers

Read when a feature needs a behaviour the library does not have, or the vendored `vuetify0` skill's advice meets a feature. The one-line rules are in `SKILL.md`; this page is their full statement.

- **A feature uses the library; only the library imports Vuetify 0.** The library's folders are listed in the `oxlint.config.ts` override that lifts the `@vuetify/v0` ban. When a feature needs a behaviour the library does not have yet, grow the library first, as a separate commit — never import Vuetify 0 from the feature behind a disable.

- **The vendored `vuetify0` skill applies inside the library only.** Its "never a native button, use Button" rule is right for the library's own components and wrong for a feature, which uses the library's component instead. Where the two skills disagree, this one wins.
