# Fields

Read when adding a search, a text field or a form. `SKILL.md` has the one-line rules; the reasons are here.

- **A search is `UiTextField` with the search type**: a pill with a search mark, its label as the hint inside it and still its accessible name, and its own clear button once it holds text, so a feature never draws one beside it. A surface rule draws and never lays out: `ui-field` carries no padding, which the call site gives. A field is a step off the surface it sits in — `--ui-field-background`, one translucent layer of the text colour that no surface overrides — never an accent tint at rest, which reads as a highlight, and draws no ring and no shade at rest: `ui-field` tints it while focused, and the text field while invalid, so a feature adds neither. the UnoCSS preset's preflight already strips the native inset border of `input`, `textarea` and `select`, so a feature never adds `b-none` to an input.

- **A field is `UiTextField` inside a `UiForm`**, passed rules from `UiRules` — the library's builders, one wording across every field — or a `UiRule` of its own. A list built from constants is a plain array, never a computed. The form's `isValid` is false only once a field has failed, so a submit button can stand disabled on it.
