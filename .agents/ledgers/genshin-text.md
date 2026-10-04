# Genshin text

Every word the game says, referenced by its text id and written by the generator.

| Unit                                                                                                     | Swept                  | Notes |
| -------------------------------------------------------------------------------------------------------- | ---------------------- | ----- |
| `packages/genshin-text`                                                                                  | 2026-10-04 · Fable 5.1 |       |
| `scripts/src/services/genshinText`                                                                       | —                      |       |
| the readers — `packages/genshin-world`, `packages/genshin-interface`, `apps/web/app/composables/genshin` | —                      |       |
| `packages/genshin-persona/src/localizations`, `packages/genshin-persona/src/generated`                   | —                      |       |

## Open findings

- **Screen-reader labels are English literals.** `Loading/Startup` and the interface library's `LoadingSpinner` label themselves `aria-label="Loading"`, and the login's corner buttons are labelled by `InterfaceIcon`'s own names and a literal `Quit`, so a reader in any other language hears English over a screen whose every drawn word is the game's. The game says the first already (`GameTextKey.Loading`, whose English carries an ellipsis); the buttons' words want a `find` each. It is a decision rather than a fix because the labels' text changes for every language, `Loading/Startup` gains a required `gameText` prop its hosts must pass, and `LoadingSpinner` and `RoundButton` callers a label from it. Options: take each label from the game text where `find` shows the game says it, or settle that a label nobody sees stays English and say so in the skill.
