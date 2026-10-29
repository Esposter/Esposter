import { defineComponent, h } from "vue";

// NuxtImg is the image component the Nuxt app registers for every page, so a screen that draws an avatar with it resolves
// Only there. The suites draw it as the plain image it renders, which is what a stub of it must be
export const NuxtImgStub = defineComponent({
  props: { alt: { required: true, type: String }, src: { required: true, type: String } },
  setup: (componentProps) => () => h("img", { alt: componentProps.alt, src: componentProps.src }),
});
