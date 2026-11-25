// The signed-in user's id, "" for a guest
export const useSessionUserId = () => {
  const session = useSessionData();
  return computed(() => session.value?.user.id ?? "");
};
