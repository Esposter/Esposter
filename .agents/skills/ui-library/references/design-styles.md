# Design Styles

Read when a feature's look seems to differ by design style, or a library component draws something no token can express. `SKILL.md` states each rule in a line; this page is each in full, with the tests that hold it.

- **A feature never names a style.** It reaches the look through a surface rule, a token or an icon meaning, never a shadow in steps, a face or an icon set by hand, so both styles draw it. `useUiStyle` and the `data-ui-style` attribute are the library's alone: oxlint refuses the composable elsewhere, and `app/templates.test.ts` refuses the attribute and its selector outside the library, `NuxtTheme` and the document chrome, an edge in steps outside the library, and voxel's face or icon set anywhere but the icon map.

- **A drawing no token can express belongs to the library.** The component carries the nearest style on its own element through `useUiStyle` and keys its scoped style or its shortcut on it, as the spinner, the skeleton and `ui-blocks` do, with the same DOM and roles in every style. A token is always preferred where one can say it, since a token already resolves at the nearest scope.
