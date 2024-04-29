import { IconComponentMap } from "@/services/dungeons/IconComponentMap";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("vuetify:configuration", ({ vuetifyOptions }) => {
    vuetifyOptions.icons = {
      sets: {
        custom: {
          component: (props) =>
            h(props.tag, [h(IconComponentMap.get(props.icon as string) ?? "", { class: "v-icon__svg" })]),
        },
      },
    };
  });
});
