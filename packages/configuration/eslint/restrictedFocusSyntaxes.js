// The Nuxt app's own SFCs and composables, which is where `useAutofocus` is auto-imported: a game package that shares
// This config focuses its own screens as they open and has no text entry for a reader to be typing in, so it is out of
// Scope by where the composable exists rather than by a list of paths. A `.focus()` after an action — a move, a close,
// An error — is the keyboard following the reader, and is not inside `onMounted`.
export default [
  {
    // A Tiptap chain's `.focus()` is a command, not the element's focus
    message:
      "Don't focus an element in `onMounted`. Give a library component `is-autofocus`, or call `useAutofocus(element)`, which leaves a reader typing elsewhere alone. See the ui-library skill's fields page.",
    selector:
      "CallExpression[callee.name='onMounted'] CallExpression[callee.property.name='focus']:not([callee.object.callee.property.name='chain'])",
  },
];
