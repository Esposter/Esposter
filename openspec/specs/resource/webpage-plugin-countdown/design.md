# Webpage Plugin Countdown

The webpage editor's Extra category holds a countdown block: a day, hour, minute and second clock to a start date, then an end text. It comes from `countdownPlugin`, our own module that replaces the `grapesjs-component-countdown` npm package. It takes no options, as the app never passed the package any.

## How it works

The plugin registers the block `countdown` and the component type `countdown` on the editor, under the upstream ids, so saved projects that reference them load unchanged. The component has two traits: `startfrom` (a date input, the Start trait) and `endText` (the End text trait). The component's script runs in the canvas with those two properties and is re-run when either changes.

The script counts down to the start, reading a date-only value as local midnight of that day. The date-and-time forms are read field by field, since Safari rejects the space-separated form. When the start has passed, the end text is written as text and the counter is hidden. Each countdown keeps its own timer on its element, and the timer stops itself once the element is no longer in the document, so a component re-rendered by a trait change leaves no timer behind.

## Upstream

Its 17 issues and pull requests, with their verdicts, then the three defects its source showed beyond them:

| Upstream    | Subject                                                      | Verdict                      | Proof or owner                                                                                                                                                              |
| :---------- | :----------------------------------------------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #1          | Updating the date with the trait input                       | Out of scope, browser        | The trait is a native date input; the maintainer points at the custom trait route (artf/grapesjs#807)                                                                       |
| #2, #5, #7  | A custom date picker for the start date                      | Feature not needed           | The maintainer's answer is a custom trait type; the editor uses the native `date` trait, and "dateInputType" is not exposed                                                 |
| #3, #10     | Reloading exported HTML loses the countdown script           | Out of scope, grapesjs core  | The maintainer's answer is to store JSON, not HTML; `script-props` components re-run from their definition on load                                                          |
| #4          | Countdown runs wrong in a video                              | Out of scope                 | Closed after the reporter confirmed the maintainer's fiddle works; no reproduction                                                                                          |
| #6          | A saved start date does not update the script                | Out of scope, grapesjs core  | A `startfrom` change re-renders the component through `__scriptPropsChange` (grapesjs 0.23), so the script re-runs; the maintainer calls the saved-script report an old bug |
| #8          | Editing text in Safari 12                                    | Out of scope, grapesjs core  | The canvas's contenteditable, not the countdown; Safari 12 is end of life                                                                                                   |
| #9          | A fixed clock that restarts at each load                     | Feature not needed           | The clock is the `startfrom` value by design; the maintainer's answer is to edit it                                                                                         |
| #11         | "pluginOpts" ignored                                         | False positive               | The reporter wrapped the options under `options`; the maintainer's reply gives the right shape. The module takes no options                                                 |
| #12         | Styling one countdown restyles every countdown               | Out of scope, grapesjs core  | Class selectors are shared; the maintainer's answer is grapesjs's component-first selectors                                                                                 |
| #14, #17    | Styles lost after reloading from storage                     | Out of scope, grapesjs core  | Closed upstream as no longer reproducing (#14); the component's styles are its own, stored with the project                                                                 |
| #15         | `style` and `styleAdditional` do not replace the default     | Feature not needed           | Both options are removed; the component's default styles are its own and editable in the style manager                                                                      |
| #18, PR #13 | Breaking change from grapesjs 0.20.1, and an empty update PR | Out of scope, fixed upstream | Version 1.0.2 is the upstream fix, and the module targets grapesjs 0.23                                                                                                     |

Beyond the issues, the source showed these, each fixed and tested as "no upstream issue":

- A date-only start was read as UTC midnight, so the countdown ended hours away from local midnight of the chosen day. Fixed by parsing the fields as local time.
- The end text was written with `innerHTML`, so markup typed into it ran in the published page. Fixed by writing it as text.
- A countdown whose element was re-rendered kept its interval running on the detached element until another countdown's script happened to run. The window-level "__gjsCountdownIntervals" registry only pruned those intervals then, and it held the detached elements. Fixed: the registry is gone and each timer stops itself once its element is detached. The registry lives on the canvas frame's window, so it never crossed editor instances.

## Key files

| File                                                                  | Role                                                                  |
| :-------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `apps/web/app/services/webpageEditor/plugins/countdownPlugin.ts`      | The module: the countdown component type, its script and its options  |
| `apps/web/app/services/webpageEditor/plugins/countdownPlugin.test.ts` | The component and script tests                                        |
| `apps/web/app/services/webpageEditor/WebpageEditorPlugins.ts`         | The editor's plugin list, where the plugin is passed with its options |

## Sources

- Upstream repository: `GrapesJS/components-countdown` at 1.0.2, from its source map.
- grapesjs 0.23 for `script-props`, the canvas script container and component re-rendering.
