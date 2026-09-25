import restrictedDateSyntaxes from "@esposter/configuration/eslint/restrictedDateSyntaxes.js";
import restrictedStoreSyntaxes from "@esposter/configuration/eslint/restrictedStoreSyntaxes.js";
import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";

// The Vuetify inputs `vuetify.config.ts` declares `hideDetails: "auto"` for. Shared by the two halves of the
// `hide-details` ban below so the static and bound forms can never cover different tags. A component missing from
// This list is caught by neither, which is the failure to watch for: adding an input to `vuetify.config.ts` means
// Adding it here in the same change, or its instances may quietly restate the default.
const VUETIFY_INPUT_ELEMENT_REGEX =
  "/^v-(autocomplete|checkbox|color-input|combobox|file-input|radio-group|select|slider|switch|textarea|text-field)$/";

export default {
  // Not covered by eslint-plugin-oxlint on vue files — its vue-svelte-astro-exceptions config
  // Deliberately keeps unused-vars rules enabled there, so this off is still load-bearing.
  "@typescript-eslint/no-unused-vars": "off",
  // `<script setup>` is the only component authoring style here. The Options API runtime is compiled out of the
  // Bundle entirely (`future.compatibilityVersion: 5` defaults `vue.optionsApi` off), so an options component of
  // Ours would mount against a runtime that cannot apply it and fail at render rather than at build. Plain
  // `defineComponent(...)` composition is banned with it: it buys nothing script setup does not, and leaving it
  // Allowed is what lets an options block back in one property at a time.
  "vue/component-api-style": ["error", ["script-setup"]],
  // PascalCase for our components and PascalCase third-party (VueFlow, VuePdfEmbed); kebab-case is only for
  // Third-party libraries that ship kebab tags (Vuetify's v-*) and TresJS's lowercase <primitive> special
  // Element. A compound part is PascalCase on both sides of its dot (Vuetify 0's `Select.Root`), since the
  // Library exports each compound as one namespace object. registeredComponentsOnly is useless under Nuxt
  // Auto-imports (nothing is locally registered), so check every non-HTML tag.
  "vue/component-name-in-template-casing": [
    "error",
    "PascalCase",
    {
      ignores: ["/^v-/", "primitive", String.raw`/^[A-Z][A-Za-z]*\.[A-Z][A-Za-z]*$/`],
      registeredComponentsOnly: false,
    },
  ],
  // Styles are scoped by default; the rare global block (e.g. transition classes for slotted content,
  // Third-party DOM appended to document.body) carries an eslint-disable with its reason. Library CSS
  // Belongs in a script-setup `import "lib.css"` (code-split with the component), not a global style block.
  "vue/enforce-style-attribute": ["error", { allow: ["scoped"] }],
  "vue/html-self-closing": "off",
  "vue/multi-word-component-names": "off",
  // Raw <a> bypasses client-side routing (full reloads) and default link styles. Use <NuxtLink :to> for internal
  // Routes, <NuxtLink :to external target> for external URLs, <NuxtInvisibleLink :to="{ hash }"> for in-page anchors,
  // And navigateTo for imperative navigation.
  "vue/no-restricted-html-elements": [
    "error",
    {
      element: "a",
      message:
        'Don\'t use a raw <a>. Use <NuxtLink :to> (internal), <NuxtLink :to external target> (external), <NuxtInvisibleLink :to="{ hash }"> (in-page anchor), or navigateTo for imperative navigation.',
    },
    {
      element: "v-img",
      message:
        "Don't use <v-img>. It gates its render on an IntersectionObserver that only exists in the browser, so it renders on the server and not on hydration. Use <NuxtImg>, sizing it with CSS utilities (its width/height props are html attributes for the optimizer, not styles) and stating object-contain/object-cover wherever both dimensions are constrained.",
    },
    {
      element: "img",
      message: "Don't use a raw <img>. Use <NuxtImg>.",
    },
    {
      element: "time",
      message: "Don't hand-write <time>. Use <NuxtTime>, which renders one and formats it hydration-safely.",
    },
    // A Vuetify component with no consumer left on the UI library's page migration, so it cannot come back
    {
      element: "v-counter",
      message:
        "Don't use <v-counter>. Vuetify is leaving for the UI library: a field counts with UiTextField's counter prop, and an editor counts under itself as RichTextEditor does.",
    },
    {
      element: "v-pull-to-refresh",
      message:
        "Don't use <v-pull-to-refresh>. Vuetify is leaving for the UI library, and a page that scrolls the document is refreshed by the browser's own pull-to-refresh.",
    },
    ...["v-breadcrumbs", "v-breadcrumbs-divider", "v-breadcrumbs-item"].map((element) => ({
      element,
      message: `Don't use <${element}>. Vuetify is leaving for the UI library: a trail of links back is UiBreadcrumbs.`,
    })),
    {
      element: "v-data-table-server",
      message:
        "Don't use <v-data-table-server>. Vuetify is leaving for the UI library: a page of rows a server reads is UiDataTable.",
    },
    ...["v-tabs-window", "v-tabs-window-item"].map((element) => ({
      element,
      message: `Don't use <${element}>. Vuetify is leaving for the UI library: tabs over the panel of the selected one are UiTabs.`,
    })),
    {
      element: "v-data-table",
      message:
        "Don't use <v-data-table>. Vuetify is leaving for the UI library: a table is UiDataTable, which searches, sorts and pages every row itself when no server counts them.",
    },
    ...["v-expansion-panels", "v-expansion-panel", "v-expansion-panel-text", "v-expansion-panel-title"].map(
      (element) => ({
        element,
        message: `Don't use <${element}>. Vuetify is leaving for the UI library: a section that opens and closes is UiCollapsible, its actions beside its trigger.`,
      }),
    ),
    {
      element: "v-color-input",
      message: "Don't use <v-color-input>. Vuetify is leaving for the UI library: a colour is UiColorField.",
    },
    {
      element: "v-overlay",
      message:
        "Don't use <v-overlay>. Vuetify is leaving for the UI library: a modal is UiDialog, and a region's own cover is an absolutely placed element in the tokens.",
    },
    ...[
      "v-app-bar",
      "v-app-bar-title",
      "v-card",
      "v-card-actions",
      "v-card-item",
      "v-card-subtitle",
      "v-card-text",
      "v-card-title",
      "v-toolbar",
      "v-toolbar-title",
    ].map((element) => ({
      element,
      message: `Don't use <${element}>. Vuetify is leaving for the UI library: a region is ui-frame and a bar over it ui-bar, with a heading in the type scale.`,
    })),
    {
      element: "v-alert",
      message:
        "Don't use <v-alert>. Vuetify is leaving for the UI library: a line the page says about itself is UiAlert, and a passing message a toast.",
    },
    {
      element: "v-avatar",
      message: "Don't use <v-avatar>. Vuetify is leaving for the UI library: a picture or an initial is UiAvatar.",
    },
    {
      element: "v-badge",
      message:
        "Don't use <v-badge>. Vuetify is leaving for the UI library: a count or a mark set into a surface is UiChip.",
    },
    {
      element: "v-btn",
      message:
        "Don't use <v-btn>. Vuetify is leaving for the UI library: anything pressed is UiButton, UiIconButton, or UiButtonLink for somewhere to go.",
    },
    {
      element: "v-btn-toggle",
      message:
        "Don't use <v-btn-toggle>. Vuetify is leaving for the UI library: one of a few ways to do one thing is UiToggleGroup.",
    },
    ...["v-carousel", "v-carousel-item"].map((element) => ({
      element,
      message: `Don't use <${element}>. Vuetify is leaving for the UI library: a set of pictures is laid out in the tokens, with the library's buttons to move through it.`,
    })),
    ...["v-checkbox", "v-checkbox-btn"].map((element) => ({
      element,
      message: `Don't use <${element}>. Vuetify is leaving for the UI library: a checkbox is UiCheckbox.`,
    })),
    {
      element: "v-code",
      message:
        "Don't use <v-code>. Vuetify is leaving for the UI library: inline code is a <code> element, which the type rules draw.",
    },
    ...["v-col", "v-container", "v-row", "v-spacer"].map((element) => ({
      element,
      message: `Don't use <${element}>. Vuetify is leaving for the UI library: a layout is grid and flex utilities, which take the page's full width.`,
    })),
    {
      element: "v-autocomplete",
      message:
        "Don't use <v-autocomplete>. Vuetify is leaving for the UI library: a field holding tokens over a panel is UiTokenField, and completions under a field are UiSuggestions.",
    },
    {
      element: "v-chip",
      message:
        "Don't use <v-chip>. Vuetify is leaving for the UI library: a short reading or a removable token is UiChip.",
    },
    {
      element: "v-date-picker",
      message:
        "Don't use <v-date-picker>. Vuetify is leaving for the UI library: a day is UiCalendar, and a field holding one UiDateField.",
    },
    {
      element: "v-menu",
      message:
        "Don't use <v-menu>. Vuetify is leaving for the UI library: actions are UiMenu or UiOverflowMenu, and anything else under a trigger UiPopover.",
    },
    {
      element: "v-combobox",
      message:
        "Don't use <v-combobox>. Vuetify is leaving for the UI library: a choice from a list is UiSelect, and completions under a field are UiSuggestions.",
    },
    {
      element: "v-divider",
      message:
        "Don't use <v-divider>. Vuetify is leaving for the UI library: a line is bg-divider at the border width, or the ui-bar shortcut, and space before either.",
    },
    ...["v-expand-transition", "v-fade-transition", "v-slide-y-transition"].map((element) => ({
      element,
      message: `Don't use <${element}>. Vuetify is leaving for the UI library: motion is a Transition timed by the motion tokens.`,
    })),
    {
      element: "v-file-input",
      message:
        "Don't use <v-file-input>. Vuetify is leaving for the UI library: files picked or dropped are UiFileField.",
    },
    {
      element: "v-hover",
      message:
        "Don't use <v-hover>. Vuetify is leaving for the UI library: a hover state is a hover: utility or the surface's own hover.",
    },
    {
      element: "v-label",
      message: "Don't use <v-label>. Vuetify is leaving for the UI library: a field's label is UiTextField's own.",
    },
    {
      element: "v-list-group",
      message:
        "Don't use <v-list-group>. Vuetify is leaving for the UI library: a group that opens and closes is UiCollapsible.",
    },
    ...["v-list-item-subtitle", "v-list-item-title", "v-list-subheader"].map((element) => ({
      element,
      message: `Don't use <${element}>. Vuetify is leaving for the UI library: a list is UiList, its rows drawn by UiItemContent under their group's heading.`,
    })),
    {
      element: "v-pagination",
      message:
        "Don't use <v-pagination>. Vuetify is leaving for the UI library: pages are UiDataTable's pager, or a previous and next pair of UiButtons.",
    },
    {
      element: "v-progress-circular",
      message: "Don't use <v-progress-circular>. Vuetify is leaving for the UI library: a wait is UiSpinner.",
    },
    {
      element: "v-progress-linear",
      message:
        "Don't use <v-progress-linear>. Vuetify is leaving for the UI library: progress is UiLoadingBar or UiLoadingLine, and how much is used UiMeter.",
    },
    ...["v-radio", "v-radio-group"].map((element) => ({
      element,
      message: `Don't use <${element}>. Vuetify is leaving for the UI library: one answer out of a list is UiRadioGroup, and one of a few short ways UiToggleGroup.`,
    })),
    {
      element: "v-select",
      message: "Don't use <v-select>. Vuetify is leaving for the UI library: a choice from a list is UiSelect.",
    },
    {
      element: "v-skeleton-loader",
      message:
        "Don't use <v-skeleton-loader>. Vuetify is leaving for the UI library: content on its way is UiSkeleton in the content's own shape.",
    },
    {
      element: "v-slider",
      message: "Don't use <v-slider>. Vuetify is leaving for the UI library: a number along a track is UiSlider.",
    },
    {
      element: "v-snackbar",
      message: "Don't use <v-snackbar>. Vuetify is leaving for the UI library: a passing message is a toast.",
    },
    {
      element: "v-switch",
      message:
        "Don't use <v-switch>. Vuetify is leaving for the UI library: a setting that takes effect as it flips is UiSwitch.",
    },
    ...["v-tab", "v-tabs", "v-window", "v-window-item"].map((element) => ({
      element,
      message: `Don't use <${element}>. Vuetify is leaving for the UI library: tabs over the panel of the selected one are UiTabs, and tabs that go somewhere UiTabLinks.`,
    })),
    {
      element: "v-table",
      message: "Don't use <v-table>. Vuetify is leaving for the UI library: a table is UiDataTable.",
    },
    {
      element: "v-textarea",
      message:
        "Don't use <v-textarea>. Vuetify is leaving for the UI library: a field of several lines is UiTextField with rows.",
    },
    {
      element: "v-tooltip",
      message:
        "Don't use <v-tooltip>. Vuetify is leaving for the UI library: a label hanging off what it names is UiTooltip, and an icon button's label is its tooltip already.",
    },
  ],
  // Every input Vuetify renders in this app declares `hideDetails: "auto"` once in `vuetify.config.ts`, so a
  // Per-field `hide-details` restates the default at best and defeats it at worst: the bare attribute means
  // `true`, which silently swallows the validation message a field with rules exists to report. The bound form
  // Is banned beside it in `vue/no-restricted-syntax` — a binding there computes what "auto" already answers
  // Per render.
  "vue/no-restricted-static-attribute": [
    "error",
    {
      element: VUETIFY_INPUT_ELEMENT_REGEX,
      key: "hide-details",
      message:
        'Don\'t write `hide-details` on a Vuetify input — `vuetify.config.ts` already declares `hideDetails: "auto"` for it. The bare attribute is `true`, which hides the validation message a field with rules has to show.',
    },
  ],
  // Object.* calls in a render-evaluated template expression (bind, v-for, interpolation) allocate a fresh
  // Reference every render, breaking prop reference-equality and forcing needless re-renders. Hoist to a
  // Script-setup const (static maps) or computed (reactive). Event handlers (@on) run per-event, so exempt.
  "vue/no-restricted-syntax": [
    "error",
    ...restrictedSyntaxes,
    {
      // The `unicorn/no-array-for-each`, `no-array-sort` and `no-array-reverse` rules oxlint ships cover the
      // Script block and cannot see template expressions, so the same three bans are restated here for the
      // Half it does not read.
      // A mutating sort in a render expression is worse than in script: it rewrites the array it is rendering.
      // The fourth of the set — splicing a fresh copy — is in `restrictedSyntaxes` instead, because no oxlint
      // Rule covers either half of it, so one entry there reaches script and template alike.
      message:
        "Iterate with `v-for`, or move the loop into script/a computed — a template expression has no `for...of`, so `.forEach()` here has nowhere to go. Ordering takes the copying `toSorted()`/`toReversed()`: a render expression must not rewrite what it renders.",
      selector: "CallExpression[callee.property.name=/^(forEach|reverse|sort)$/]",
    },
    {
      message:
        "Don't call Object.* inline in a template render expression — it allocates a new reference every render. Hoist it to a script-setup const (static) or computed (reactive). (Event handlers are exempt.)",
      selector: "CallExpression[callee.object.name='Object']:not(VAttribute[key.name.name='on'] CallExpression)",
    },
    {
      // An unconditional call at the start of a handler is exactly what Vue event modifiers express. Raw calls
      // Remain allowed after a runtime guard (e.g. only preventDefault when the cursor is at position 0), where
      // No modifier can encode the condition.
      message:
        "Use Vue event modifiers (@event.stop / @event.prevent, with key modifiers where applicable) instead of an unconditional event method call at the start of a handler. Raw calls are only for conditional use behind a guard.",
      selector:
        ":matches(VOnExpression, ArrowFunctionExpression > BlockStatement, FunctionExpression > BlockStatement) > ExpressionStatement:first-child > CallExpression[callee.property.name=/^(preventDefault|stopPropagation)$/], ArrowFunctionExpression > CallExpression[callee.property.name=/^(preventDefault|stopPropagation)$/]",
    },
    {
      // The static form is banned in `vue/no-restricted-static-attribute`; this is the same ban for the bound
      // One. A binding here computes what "auto" already answers per render — no row when there is no message,
      // A row when there is — so the condition is either that rule restated or a field deliberately suppressing
      // Its own validation message.
      message:
        'Don\'t bind `:hide-details`. `vuetify.config.ts` declares `hideDetails` as "auto" for every input, which already hides the details row exactly when there is no message to show.',
      selector: `VElement[rawName=${VUETIFY_INPUT_ELEMENT_REGEX}] > VStartTag > VAttribute[directive=true][key.name.name='bind'][key.argument.name='hide-details']`,
    },
    {
      // `vue/v-bind-style` only reads a bound argument, so `v-bind:x` is caught and the argument-less object form is
      // Not; this is the same shorthand for the half it does not see
      message: 'Spread an object of bindings with the shorthand: `:="attrs"`, never `v-bind="attrs"`.',
      selector: "VAttribute[directive=true][key.name.rawName='bind'][key.argument=null]",
    },
    {
      // A bare reference forwards whatever the event hands it as the first argument, which the handler rarely
      // Means to read — a DOM event lands in a parameter that wanted an id. A handler that does want the payload
      // Says so with an arrow, so the call site shows what it passes
      message:
        'Call the handler instead of naming it: `@click="save()"`, or an arrow when it takes the payload — `@select="(id) => selectRole(id)"`.',
      selector:
        "VAttribute[directive=true][key.name.name='on'] > VExpressionContainer > :matches(Identifier, MemberExpression)",
    },
    ...restrictedDateSyntaxes,
    ...restrictedStoreSyntaxes,
  ],
  "vue/no-unused-vars": "off",
  "vue/no-v-html": "off",
  "vue/no-v-text-v-html-on-component": "off",
  "vue/padding-line-between-blocks": ["error", "always"],
  // Load-bearing, and a pair with the `"off"` in `.oxlintrc.json` rather than a duplicate of it.
  // `eslint-plugin-oxlint` emits a disable for every rule in an enabled category and then deletes that disable
  // Again for any rule the config deactivates — it only switches off the twins of rules oxlint actually runs.
  // So dropping this half as redundant turns the rule back on in ESLint alone, on a tree oxlint passes clean.
  "vue/require-default-prop": "off",
  "vue/v-bind-style": ["error", "shorthand", { sameNameShorthand: "always" }],
  "vue/v-slot-style": ["error", { atComponent: "shorthand" }],
  "vue/valid-template-root": "off",
};
