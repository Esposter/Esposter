export const useUserSearchStore = defineStore("message/user/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher((searchQuery, cursor, options) =>
    $trpc.friend.searchUsers.query({ cursor, name: searchQuery }, options),
  );
});
