export const useReadData = async (unauthedReader: () => void, authedReader: () => Promise<void>, csr?: true) => {
  const { status } = useAuth();
  watch(status, async (newValue) => {
    if (newValue === "authenticated") await authedReader();
    else if (newValue === "unauthenticated") unauthedReader();
  });

  if (status.value === "authenticated") await authedReader();
  // We'll assume that not being authenticated means that we will read from local storage for data
  // If it's already client-side rendered (csr) then we do not need to add onMounted
  else if (status.value === "unauthenticated") csr ? unauthedReader() : onMounted(unauthedReader);
};
