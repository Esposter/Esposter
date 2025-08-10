import type { VList } from "vuetify/components";

export const useMessageScrollStore = defineStore("esbabbler/messageScroll", () => {
  const messageContainer = ref<InstanceType<typeof VList> | null>(null);
  const messageContainerElement = computed(() => messageContainer.value?.$el as HTMLDivElement | null);
  const { y } = useScroll(messageContainerElement);
  const isViewingOlderMessages = computed(() => y.value < -2000);
  const scrollToBottom = () => messageContainerElement.value?.scrollTo({ behavior: "smooth", top: 0 });
  return {
    isViewingOlderMessages,
    messageContainer,
    messageContainerElement,
    scrollToBottom,
  };
});
