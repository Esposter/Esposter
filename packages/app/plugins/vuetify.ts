import { IconComponentMap } from "@/services/dungeons/IconComponentMap";
import type { IconProps } from "vuetify";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("vuetify:configuration", ({ vuetifyOptions }) => {
    vuetifyOptions.icons = {
      sets: {
        custom: {
          component: (props: IconProps) =>
            h(props.tag, [h(IconComponentMap[props.icon as string], { class: "v-icon__svg" })]),
        },
      },
    };
  });
});
