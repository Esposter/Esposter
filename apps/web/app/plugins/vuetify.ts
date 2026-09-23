import type { IconProps } from "vuetify";

import { IconComponentMap } from "@/services/vuetify/IconComponentMap";
import { takeOne } from "@esposter/shared";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("vuetify:configuration", ({ vuetifyOptions }) => {
    // The module's icon configuration runs first and carries the UnoCSS aliases, so the custom set joins it
    vuetifyOptions.icons = {
      ...vuetifyOptions.icons,
      sets: {
        ...vuetifyOptions.icons?.sets,
        custom: {
          component: (props: IconProps) =>
            h(props.tag, [h(takeOne(IconComponentMap, props.icon as string), { class: "v-icon__svg" })]),
        },
      },
    };
  });
});
