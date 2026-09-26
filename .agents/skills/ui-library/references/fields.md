# Fields

Read when adding a search, a text field or a form. The one-line rules are in `SKILL.md`; this page is their full statement.

- **A search is `UiTextField` with the search type**: a pill with a search mark, its label as the hint inside it and still its accessible name, and its own clear button once it holds text, so a feature never draws one beside it. A surface rule draws and never lays out: `ui-field` carries no padding, which the call site gives. A field is the panel tone and draws no line, no ring and no shade: `ui-field` tints it while focused, and the text field while invalid, so a feature adds neither. `globals.scss`'s reset layer already strips the native inset border of `input`, `textarea` and `select`, so a feature never adds `b-none` to an input.

- **A field is `UiTextField` inside a `UiForm`**, passed rules from `UiRules` — the library's builders, one wording across every field — or a `UiRule` of its own. A list built from constants is a plain array, never a computed. The form's `isValid` is false only once a field has failed, so a submit button can stand disabled on it.
