import restrictedDateSyntaxes from "@esposter/configuration/eslint/restrictedDateSyntaxes.js";
import restrictedDeleteSyntaxes from "@esposter/configuration/eslint/restrictedDeleteSyntaxes.js";
import restrictedImageSyntaxes from "@esposter/configuration/eslint/restrictedImageSyntaxes.js";
import restrictedStoreSyntaxes from "@esposter/configuration/eslint/restrictedStoreSyntaxes.js";
import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";
import restrictedTrimSyntaxes from "@esposter/configuration/eslint/restrictedTrimSyntaxes.js";

// The template's own selector bans; the script's are oxlint's
export const TEMPLATE_RESTRICTED_SYNTAXES: { message: string; selector: string }[] = [
  ...restrictedSyntaxes,
  ...restrictedTrimSyntaxes,
  {
    // The `unicorn/no-array-for-each`, `no-array-sort` and `no-array-reverse` rules oxlint ships cover the script and
    // Cannot see template expressions, so the same three bans are restated for the half they do not read. A mutating
    // Sort in a render expression rewrites the array it is rendering
    message:
      "Iterate with `v-for`, or move the loop into script/a computed — a template expression has no `for...of`, so `.forEach()` here has nowhere to go. Ordering takes the copying `toSorted()`/`toReversed()`: a render expression must not rewrite what it renders.",
    selector: "CallExpression[callee.property.name=/^(forEach|reverse|sort)$/]",
  },
  {
    // An `Object.*` call in a render expression allocates a fresh reference every render, which breaks prop reference
    // Equality and re-renders for nothing. An event handler runs per event, so it is exempt
    message:
      "Don't call Object.* inline in a template render expression — it allocates a new reference every render. Hoist it to a script-setup const (static) or computed (reactive). (Event handlers are exempt.)",
    selector: "CallExpression[callee.object.name='Object']:not(VAttribute[key.name.name='on'] CallExpression)",
  },
  {
    // An unconditional call at the start of a handler is what an event modifier expresses. A raw call stays allowed
    // Behind a runtime guard, which no modifier can encode
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
    // `vue/v-bind-style` reads only a bound argument, so the argument-less object form takes this ban
    message: 'Spread an object of bindings with the shorthand: `:="attrs"`, never `v-bind="attrs"`.',
    selector: "VAttribute[directive=true][key.name.rawName='bind'][key.argument=null]",
  },
  {
    // A bare reference forwards whatever the event hands it as the first argument, which the handler rarely means to
    // Read. A handler that wants the payload says so with an arrow
    message:
      'Call the handler instead of naming it: `@click="save()"`, or an arrow when it takes the payload — `@select="(id) => selectRole(id)"`.',
    selector:
      "VAttribute[directive=true][key.name.name='on'] > VExpressionContainer > :matches(Identifier, MemberExpression)",
  },
  // The three element bans are selectors rather than `vue/no-restricted-html-elements`, whose vize options name the
  // Elements and drop the message saying what to use instead
  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13536 — move them to vue/no-restricted-html-elements once it takes a message
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
  ...restrictedDateSyntaxes,
  ...restrictedDeleteSyntaxes,
  ...restrictedImageSyntaxes,
  ...restrictedStoreSyntaxes,
];
