import type { VNodeChild } from "vue";
import type { VHover } from "vuetify/lib/components/VHover/VHover.mjs";

// What `v-hover`'s default slot hands its content, which Vuetify types only as the slot function's parameter.
export type VHoverSlotProps =
  Extract<VHover["v-slot:default"], Function> extends (props: infer P) => VNodeChild ? P : never;
