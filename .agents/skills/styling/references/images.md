# Images Are `<NuxtImg>`, Sized in CSS

Read when adding or sizing an image.

A raw `<img>` is a `vue/no-restricted-html-elements` error: `NuxtImg` is the one image, so what an image is given — its provider, its loading and its sizes — is decided in one place.

## Two things the lint rule cannot tell you

- **`width` / `height` are html attributes, not styles.** They take bare numbers, so a percentage or a rem is silently dropped. Under this app's `none` provider they resize nothing either — nothing transforms the source, and the pair is rendered straight onto the `<img>` to reserve its layout box. They only become optimizer inputs under a provider that actually transforms. Either way sizing is CSS utilities (`w-full`, `max-w-180`, `size-8`), and a computed dimension goes through `:style` on the wrapper.
- **State `object-contain` / `object-cover` wherever both dimensions are constrained** — inside an avatar, at a `size-*`, or under a `size-full` class. An `<img>` defaults to `object-fit: fill` and stretches. Where only the width is set, the height follows the natural ratio and object-fit is a no-op worth leaving out.

## The provider is `none`

`configuration/image.ts`, so `NuxtImg` rewrites no urls — it is a plain `<img>` with Nuxt's component API. Turning the optimizer on is a deliberate change, not a default to assume.
