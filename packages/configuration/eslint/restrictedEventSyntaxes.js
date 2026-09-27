// A bare `@click.stop` is a wall built around a control so the container behind it does not also act on the click. The
// Container owns that decision instead: whatever opens on a click asks `checkIsNestedInteraction` first, which already
// Leaves a link, a control, a dialog mounted inside it and a finished text selection alone. A wall only covers the
// Controls someone remembered — never the link inside rendered HTML — so none is built.
export default [
  {
    message:
      "Don't wall a control off with a bare `@click.stop`. The container that opens on a click asks `checkIsNestedInteraction(event)` first, and a region that is its own control without being a link, button or field carries `data-nested-interaction`. See /docs/architecture/nested-interactions.",
    selector:
      "VAttribute[directive=true][key.name.name='on'][key.argument.name='click'][value=null]:has(VIdentifier[name='stop'])",
  },
];
