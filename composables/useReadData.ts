export const useReadData = (unauthedReader: () => void, authedReader: () => Promise<void>) => {
  const { status } = useAuth();

  const { trigger } = watchTriggerable(status, async (newValue) => {
    if (newValue === "authenticated") {
      await authedReader();
      return;
    }

    if (newValue === "unauthenticated") {
      unauthedReader();
    }
  });

  onMounted(trigger);
};
