import type { SelectorBan } from "#scripts/models/oxlint/selectorBan/SelectorBan";

import { SELECTOR_BAN_LISTS } from "#scripts/services/oxlint/selectorBan/selectorBanLists";
import { COMPONENT_CASING_SYNTAXES } from "#vite/services/componentCasingSyntaxes";

// The template's selector bans: every list that marks itself as one, and the bans only a template can break
export const TEMPLATE_RESTRICTED_SYNTAXES: SelectorBan[] = [
  ...SELECTOR_BAN_LISTS.filter(({ isTemplate }) => isTemplate).flatMap(({ bans }) => bans),
  ...COMPONENT_CASING_SYNTAXES,
  {
    // The `unicorn/no-array-for-each`, `no-array-sort` and `no-array-reverse` rules oxlint ships cover the script.
    // They cannot see template expressions, so the same three bans are restated for the half they do not read.
    // A mutating sort in a render expression rewrites the array it is rendering.
    message:
      "Iterate with `v-for`, or move the loop into script/a computed — a template expression has no `for...of`, so `.forEach()` here has nowhere to go. Ordering takes the copying `toSorted()`/`toReversed()`: a render expression must not rewrite what it renders.",
    selector: "CallExpression[callee.property.name=/^(forEach|reverse|sort)$/]",
  },
  {
    // An `Object.*` call in a render expression allocates a fresh reference every render.
    // That breaks prop reference equality and re-renders for nothing.
    // An event handler runs per event, so it is exempt.
    message:
      "Don't call Object.* inline in a template render expression — it allocates a new reference every render. Hoist it to a script-setup const (static) or computed (reactive). (Event handlers are exempt.)",
    selector: "CallExpression[callee.object.name='Object']:not(VAttribute[key.name.name='on'] CallExpression)",
  },
  {
    // An unconditional call at the start of a handler is what an event modifier expresses.
    // A raw call stays allowed behind a runtime guard, which no modifier can encode.
    message:
      "Use Vue event modifiers (@event.stop / @event.prevent, with key modifiers where applicable) instead of an unconditional event method call at the start of a handler. Raw calls are only for conditional use behind a guard.",
    selector:
      ":matches(VOnExpression, ArrowFunctionExpression > BlockStatement, FunctionExpression > BlockStatement) > ExpressionStatement:first-child > CallExpression[callee.property.name=/^(preventDefault|stopPropagation)$/], ArrowFunctionExpression > CallExpression[callee.property.name=/^(preventDefault|stopPropagation)$/]",
  },
  {
    // Vuetify's tags, which no package here provides. Only the kebab-case spelling is decidable, since a PascalCase
    // `V` prefix is also another library's own name
    message:
      "Don't use a Vuetify component. Draw it with the UI library's (`app/components/Ui`), or grow the library first — see openspec/specs/architecture/ui-library/design.md. An image is <NuxtImg>.",
    selector: "VElement[rawName=/^v-/]",
  },
  {
    // A bare stop walls the control off from the container that opens on a click. A stop with a handler is a choice
    // The handler makes, so only the valueless form is banned
    message:
      "Don't wall a control off with a bare `@click.stop`. The container that opens on a click asks `checkIsNestedInteraction(event)` first, and a region that is its own control without being a link, button or field carries `data-nested-interaction`. See openspec/specs/architecture/nested-interactions/design.md.",
    selector:
      "VAttribute[directive=true][key.name.name='on'][key.argument.name='click'][value=null] > VDirectiveKey > VIdentifier.modifiers[name='stop']",
  },
  {
    // `vue/v-bind-style` reads only a bound argument, so the argument-less object form takes this ban
    message: 'Spread an object of bindings with the shorthand: `:="attrs"`, never `v-bind="attrs"`.',
    selector: "VAttribute[directive=true][key.name.rawName='bind'][key.argument=null]",
  },
  {
    // A bare reference forwards whatever the event hands it as the first argument.
    // The handler rarely means to read that argument.
    // A handler that wants the payload says so with an arrow.
    message:
      'Call the handler instead of naming it: `@click="save()"`, or an arrow when it takes the payload — `@select="(id) => selectRole(id)"`.',
    selector:
      "VAttribute[directive=true][key.name.name='on'] > VExpressionContainer > :matches(Identifier, MemberExpression)",
  },
  // The three element bans are selectors rather than `vue/no-restricted-html-elements`.
  // That rule's vize options drop the message saying what to use instead.
  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13536
  // Move them to `vue/no-restricted-html-elements` once it takes a message.
  {
    message:
      'Don\'t use a raw <a>. Use <NuxtLink :to> (internal), <NuxtLink :to external target> (external), <NuxtInvisibleLink :to="{ hash }"> (in-page anchor), or navigateTo for imperative navigation.',
    selector: "VElement[rawName='a']",
  },
  { message: "Don't use a raw <img>. Use <NuxtImg>.", selector: "VElement[rawName='img']" },
  {
    message: "Don't hand-write <time>. Use <NuxtTime>, which renders one and formats it hydration-safely.",
    selector: "VElement[rawName='time']",
  },
];
