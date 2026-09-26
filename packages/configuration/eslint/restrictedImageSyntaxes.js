// `vue/no-restricted-html-elements` bans a hand-written `<img>`, but a Vuetify 0 image part draws one itself unless
// It is handed a component. Its own `<img>` only listens for `load`, so a server-rendered image that finished before
// Hydration is never seen as loaded; NuxtImg reports that load on mount.
export default [
  {
    message:
      'A Vuetify 0 image part renders a raw <img>. Pass `:as="NuxtImg"` (from `resolveComponent("NuxtImg")`) so a load that lands before hydration is still seen.',
    selector:
      "VElement[rawName=/^(Avatar.Image|Image.Img)$/]:not(:has(VAttribute[key.name.name='bind'][key.argument.name='as']))",
  },
  {
    message: 'Don\'t render an <img> through `as="img"`. Use <NuxtImg>.',
    selector: "VAttribute[key.name='as'][value.value='img']",
  },
];
