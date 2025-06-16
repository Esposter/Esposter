export const usePushSubscriptionStore = defineStore("pushSubscription", () => {
  const pushSubscription = ref<PushSubscription>();
  return { pushSubscription };
});
