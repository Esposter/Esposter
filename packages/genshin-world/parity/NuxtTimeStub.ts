import { defineComponent, h } from "vue";

// NuxtTime is the date component the Nuxt app registers for every page, so a screen that shows a date with it resolves
// Only there. The suites draw it as the time element it renders: the instant in the attribute, and the text the browser
// Formats from the options the screen passes (`date-style`, `hour-cycle` and the rest, read as Intl's camelCase names)
// In the reader's own locale and zone, which is what the real component writes before hydration
export const NuxtTimeStub = defineComponent({
  inheritAttrs: false,
  props: { datetime: { required: true, type: String } },
  setup:
    (componentProps, { attrs }) =>
    () => {
      const options = Object.fromEntries(
        Object.entries(attrs).map(([key, value]) => [
          key.replaceAll(/-(?<letter>\w)/gu, (_match, letter: string) => letter.toUpperCase()),
          value,
        ]),
      ) as Intl.DateTimeFormatOptions;
      const text = new Intl.DateTimeFormat(undefined, options).format(new Date(componentProps.datetime));
      return h("time", { datetime: componentProps.datetime }, text);
    },
});
