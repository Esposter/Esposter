import type { Resource } from "@esposter/db-schema";

import { useNotificationStore } from "@/store/notification";

// Favorites are server-side from day one — a star that vanishes on another device reads as data loss
export const useFavoriteStore = defineStore("resource/favorite", () => {
  const { $trpc } = useNuxtApp();
  const executeToggleFavoriteMutation = useMutation();
  const notificationStore = useNotificationStore();
  const favorites = ref<Resource[]>([]);
  // Every row on /all asks "am I starred?", so the lookup is a Set rather than a scan per row
  const favoriteIds = computed(() => new Set(favorites.value.map(({ id }) => id)));
  const isLoading = ref(false);
  const readFavorites = async () => {
    isLoading.value = true;
    favorites.value = await $trpc.resource.readFavorites.query();
    isLoading.value = false;
  };
  const toggleFavorite = async (resource: Resource) => {
    const snapshot = [...favorites.value];
    await executeToggleFavoriteMutation(() => $trpc.resource.toggleFavorite.mutate({ id: resource.id }), {
      applyOptimistic: () => {
        favorites.value = favoriteIds.value.has(resource.id)
          ? favorites.value.filter(({ id }) => id !== resource.id)
          : [resource, ...favorites.value];
        return () => {
          favorites.value = snapshot;
        };
      },
      onError: (error) => {
        notificationStore.createNotification({ severity: "error", title: error.message });
      },
    });
  };
  return { favoriteIds, favorites, isLoading, readFavorites, toggleFavorite };
});
