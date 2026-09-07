import type { IconProps } from "vuetify";

import { IconComponentMap } from "@/services/dungeons/IconComponentMap";
import { takeOne } from "@esposter/shared";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("vuetify:configuration", ({ vuetifyOptions }) => {
    vuetifyOptions.icons = {
      sets: {
        custom: {
          component: (props: IconProps) =>
            h(props.tag, [h(takeOne(IconComponentMap, props.icon as string), { class: "v-icon__svg" })]),
        },
      },
    };
  });
});
