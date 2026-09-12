# Drawers

Read when adding a navigation drawer or an overlay sheet, or when one renders `inert`, closes its desktop rail with the mobile overlay, or carries a shadow it should not. The rule itself is in `SKILL.md` — every drawer goes through `StyledNavigationDrawer`, and elevation follows whether a surface overlaps what is behind it; this page is why.

## Every drawer goes through `StyledNavigationDrawer`

Never `v-navigation-drawer` directly. A permanent drawer still honours `model-value`, and Vuetify only forces one open when `permanent` _changes_ to true — the initial pass takes that branch for a null model alone. So a drawer bound to a ref that starts closed renders `inert` for the whole session, and any handler closing the mobile overlay closes the desktop rail with it. The wrapper is the single place that resolves it: while it is permanent it is open, and the model is the open state of the overlay it becomes when it is not. Bound state that is conditional on a prop cannot live in `vuetify.config.ts` — a default is a constant, so this is a component or nothing.

## A drawer is flat unless it floats over the content

Vuetify shadows a drawer only while it is temporary and open, where a scrim is already holding it off the page, and that is the whole of it — there is no app-wide elevation override. A permanent or persistent drawer reserves its own column in the layout, so the content sits beside it rather than under it and a border is separation enough. `StyledNavigationOverlay` is the other case: an absolutely-positioned sheet over the content with no scrim, where the shadow is the only thing distinguishing the two, so it states `elevation="4"` itself. Elevation follows whether the surface overlaps what is behind it, not whether it is called a drawer.
