export const useReadData = async (unauthedReader: () => void, authedReader: () => Promise<void>) => {
  const { status } = useAuth();
  watch(status, async (newValue) => {
    if (newValue === "authenticated") await authedReader();
    else if (newValue === "unauthenticated") unauthedReader();
  });

  if (status.value === "authenticated") await authedReader();
  // We'll assume that not being authenticated means that we will read from local storage for data
  else if (status.value === "unauthenticated") onMounted(unauthedReader);
};
