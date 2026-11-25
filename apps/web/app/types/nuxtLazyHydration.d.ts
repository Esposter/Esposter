declare module "vue" {
  // @TODO: no upstream issue — nuxt/nuxt: a `Lazy*` component's type intersects the component with one that takes the
  // Hydration strategies, and a construct signature's instance is read from the last member alone, so the template's
  // Prop check never sees the strategies. Each strategy the app writes is declared for every component until then
  interface ComponentCustomProps {
    hydrateOnIdle?: number | true;
  }
}

export {};
