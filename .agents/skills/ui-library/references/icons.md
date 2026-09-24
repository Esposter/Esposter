# Icons

Read when adding an icon, a meaning or an icon set's class, or when a test looks for an icon. The rule that a component and a menu's action name an icon by meaning is in `SKILL.md`; this page is how that is carried out. How icons reach both libraries is the architecture page's Icons section (`apps/web/content/docs/architecture/ui-library.md`).

- **An icon class is written whole** — `i-mdi:`, `i-pixelarticons:` or `i-lucide:` and the name — in the file that uses it — a prop or a map entry. The preset generates only what its extractor sees, so a name assembled at runtime draws nothing, and so does one written as a `v-icon`'s text content: pass it as the `icon` prop.
- **A `.ts` file that names an icon starts with `// @unocss-include`.** The pipeline does not scan TypeScript — widening it to every `.ts` file feeds the attributify extractor arbitrary code and breaks the stylesheet. `uno.config.test.ts` fails on a file that forgets.
- **A Vuetify alias needs no hand-written safelist entry.** `vuetify.config.ts` maps every alias from Vuetify's own list, and `uno.config.ts` safelists what it maps.
- **A library component names an icon by meaning** — `<UiIcon :meaning="UiIconMeaning.Remove" />` — and a new meaning is a `UiIconMeaning` member plus a class in every style's row of `UiIconMap`: standard's a Lucide class, voxel's a Pixelarticons one or an `i-mdi:` class where the pixel set has no glyph. A feature still on Vuetify keeps passing `i-mdi:` names to Vuetify's icon props.
- **An icon stays at `size-6` in every style**: the box is the layout's, so a pixel glyph stays on the pixel grid and a Lucide one keeps a row aligned. A label is passed only when the icon says something nothing beside it does.
- **A menu's action names its icon by meaning too**: a `UiItem` with `meaning`, which `UiOverflowMenu` and the context menu draw per style; `icon` stays for a glyph no meaning names, and a set's own class never appears in a feature.
- **A test finds an icon by `[class~="i-mdi:close"]`**, never `.i-mdi:close`, which is a pseudo-class selector, not a class.
