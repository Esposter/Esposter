declare module "vue" {
  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13689 — under `checkUnknownProps`, the content mapper reads
  // Only the SFC's props for an intersection with an SFC, so it drops the hydration strategies Nuxt's `LazyComponent`
  // Intersects in, which vue-tsc keeps. Each strategy the app writes is declared for every component until then
  interface ComponentCustomProps {
    hydrateOnIdle?: number | true;
  }
}

export {};
