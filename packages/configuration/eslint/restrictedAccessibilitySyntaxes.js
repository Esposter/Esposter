// `vuejs-accessibility/no-aria-hidden-on-focusable` counts `tabindex="-1"` as unfocusable, but it only leaves the tab
// Order: a click or a script still focuses the element, and the browser then drops the `aria-hidden` with a console
// Error, since focus may never sit inside a hidden subtree. Only the `hidden` attribute takes an element out of focus
// Altogether, so a proxy file input behind its labelled button is the one place the pair is honest.
export default [
  {
    message:
      'Don\'t pair `aria-hidden="true"` with `tabindex="-1"` on an element that can still take focus — a click still focuses it. Leave it in the accessibility tree with a name, or give it `hidden` if nothing may reach it. See the oxlint skill\'s template-accessibility page.',
    selector:
      "VStartTag:has(VAttribute:matches([key.name='aria-hidden'], [key.argument.name='aria-hidden'])):has(VAttribute:matches([key.name='tabindex'], [key.argument.name='tabindex'])):not(:has(VAttribute:matches([key.name='hidden'], [key.argument.name='hidden'])))",
  },
];
