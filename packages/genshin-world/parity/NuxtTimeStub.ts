import { defineComponent, h } from "vue";

// NuxtTime is the date component the Nuxt app registers for every page, so a screen that shows a date with it resolves
// Only there. The suites draw it as the plain time element it renders, which is what a stub of it must be
export const NuxtTimeStub = defineComponent({
  props: { datetime: { required: true, type: String } },
  setup: (componentProps) => () => h("time", { datetime: componentProps.datetime }),
});
