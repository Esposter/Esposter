# Async components and heavy registries

Read when a map dispatches a component by type or route, when an entry carries a heavyweight vendor, or when a component `await`s in setup and is mounted after its page resolved. The rule — a registry of heavy components holds loaders and its render site owns the wait — is in `SKILL.md`; this page is why, the `<Suspense>` boundary each render site owes, and the one case that needs nothing.

A map that dispatches a component by type or route — one entry per resource type, per file kind, per renderer —
puts **every** entry in the chunk of whoever imports the map, because a static import is unconditional. Where the
entries carry heavyweight vendors (a canvas library, an editor engine, a viewer) that means opening one type
downloads all of them, and a public page ships five renderers to a visitor who asked for one.

So a registry whose entries are heavy holds loaders, not components — `defineAsyncComponent(() => import(...))`
per entry — and consumers are unaffected, since a registry is read for presence (`if (Map[type])`) or for one
entry at a time.

```ts
export const FooComponentMap: Record<FooType, Component> = {
  [FooType.Bar]: defineAsyncComponent(() => import("@/components/Foo/Bar.vue")),
};
```

**The render site then owns the wait.** An async component renders nothing until its chunk arrives, so the
`<component :is>` goes inside a `<Suspense>` whose fallback is `StyledSkeleton` — every render site of the
registry, not just the one whose blank region someone noticed. SSR is unaffected (the server renderer resolves
the loader before it emits html, so a server-rendered page keeps its markup and its crawlability); the boundary
is for client-side navigation, where the chunk is fetched with the visitor watching.

**The boundary carries `:timeout="0"`.** `<Suspense>` defaults to holding the resolved tree up while the next
entry loads, so a registry switched by a tab or a type selector keeps the panel the reader just left on screen
with nothing saying the click landed. At zero the fallback goes up on the switch, which is what the skeleton is
for.

A registry of small components stays static: the split buys nothing and costs a request per entry.

**A component that `await`s in setup is async in the same way**, so it owes the same boundary — and only where
it is mounted _after_ its page resolved, behind a `v-if` a click flips. Without one the wait lands on the page's
own `<Suspense>`, which goes pending and holds every unrelated update on the page until the read returns; with a
recursive component, every expansion anywhere in the tree does it again. One awaited during the page's own setup
is already inside that boundary and needs nothing.
