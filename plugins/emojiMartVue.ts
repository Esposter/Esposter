import VEmojiPicker from "emoji-mart-vue-fast/src/components/Picker.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("VEmojiPicker", VEmojiPicker);
});
