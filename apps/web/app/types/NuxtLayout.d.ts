import type { NuxtLayouts } from "nuxt/app";
import type { UnionToIntersection } from "type-fest";
import type { DefineComponent } from "vue";

// `<NuxtLayout>` as `modules/nuxtLayoutTypes.ts` declares it, taking every layout's own props, since every attribute it
// Is given reaches the layout it renders as a prop. One object rather than a union keyed by `name`, because the
// Template's prop check reads only the keys every member of a union shares
type NuxtLayoutProps = UnionToIntersection<NuxtLayouts[keyof NuxtLayouts]> & { name?: keyof NuxtLayouts };

declare const NuxtLayout: DefineComponent<NuxtLayoutProps>;
export default NuxtLayout;
