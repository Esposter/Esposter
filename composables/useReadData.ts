export const useReadData = async (unauthedReader: () => void, authedReader: () => Promise<void>) => {
  const { status } = useAuth();
  const { trigger } = watchTriggerable(status, async (newValue) => {
    if (newValue === "authenticated") {
      await authedReader();
      return;
    }

    if (newValue === "unauthenticated") unauthedReader();
  });

  if (status.value === "authenticated") {
    await authedReader();
    return;
  }

  if (status.value === "unauthenticated") onMounted(trigger);
};
