import { IconComponentMap } from "@/services/vuetify/IconComponentMap";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("vuetify:before-create", ({ vuetifyOptions }) => {
    vuetifyOptions.icons = {
      sets: {
        custom: {
          component: (props) => h(props.tag, [h(IconComponentMap[props.icon as string], { class: "v-icon__svg" })]),
        },
      },
    };
  });
});
