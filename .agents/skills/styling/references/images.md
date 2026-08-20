# Images Are `<NuxtImg>`, Sized in CSS

Read when adding or sizing an image.

`<v-img>` and raw `<img>` are both `vue/no-restricted-html-elements` errors — Vuetify's defers the real `<img>` to a client-side IntersectionObserver, so the server emits the wrapper with no image in it and the picture loads only once the client observes the element.

## Two things the lint rule cannot tell you

- **`width` / `height` are html attributes, not styles.** They take bare numbers, so a percentage or a rem is silently dropped. Under this app's `none` provider they resize nothing either — nothing transforms the source, and the pair is rendered straight onto the `<img>` to reserve its layout box. They only become optimizer inputs under a provider that actually transforms. Either way sizing is CSS utilities (`w-full`, `max-w-180`, `size-8`), and a computed dimension goes through `:style` on the wrapper.
- **State `object-contain` / `object-cover` wherever both dimensions are constrained** — inside a `v-avatar`, at a `size-*`, or under a `size-full` class. A bare `<img>` defaults to `object-fit: fill` and stretches, where `v-img` defaulted to `contain`. Where only the width is set, the height follows the natural ratio and object-fit is a no-op worth leaving out.

## The provider is `none`

`configuration/image.ts`, so `NuxtImg` rewrites no urls — it is a plain `<img>` with Nuxt's component API. Turning the optimizer on is a deliberate change, not a default to assume.
