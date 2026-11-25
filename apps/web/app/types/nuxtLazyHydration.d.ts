declare module "vue" {
  // @TODO: no upstream issue — ubugeeei-prod/vize: the content mapper checks a `Lazy*` component's props against the
  // Component's own and drops the hydration strategies Nuxt's type adds, which vue-tsc keeps. A minimal Nuxt project
  // Does not reproduce it, so the trigger is still to reduce. Each strategy the app writes is declared for every
  // Component until then
  interface ComponentCustomProps {
    hydrateOnIdle?: number | true;
  }
}

export {};
