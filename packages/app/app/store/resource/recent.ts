import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { RECENT_RESOURCES_LIMIT } from "@/services/resource/constants";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";

// One target, so every read of it supersedes the one before — the primitive's latest-wins, not a flag here
const RECENTS_KEY = "recents";

// Recent means recently *opened*, and the set is the caller's own server-side access rows, so it follows them
// between devices. Home's card and the search dropdown both want the same capped list and both mount on the
// explorer home page, so the set is read once and two concurrent mounts share the in-flight query rather than
// each issuing the same request.
export const useRecentStore = defineStore("resource/recent", () => {
  const { $trpc } = useNuxtApp();
  const { executeQuery, getIsPending } = useMutation();
  const recents = ref<ResourceListItem[]>([]);
  const error = ref("");
  const isLoading = computed(() => getIsPending(RECENTS_KEY));
  // Read-once-per-session, which single-flight cannot cover: a settled read is no longer in flight to join.
  // A failed read leaves this false so the next mount — or the card's Retry — reissues it
  let isLoaded = false;
  const queryRecents = async ({ isExclusive }: { isExclusive?: true } = {}) => {
    // Taken from the source registry rather than restated, so what Recent means is one edit everywhere
    const { filter, sortBy } = ResourceListSourceDefinitionMap[ResourceListSource.Recents];
    await executeQuery(
      () => $trpc.resource.readResources.query({ ...filter, limit: RECENT_RESOURCES_LIMIT, sortBy: [...sortBy] }),
      {
        isExclusive,
        key: RECENTS_KEY,
        // Surfaced on the card as an inline alert with its own Retry rather than a toast: the card is the only
        // Thing that failed, and it has the room to say so
        onError: (readError) => {
          error.value = readError.message;
        },
        onSuccess: ({ items }) => {
          recents.value = items;
          error.value = "";
          isLoaded = true;
        },
      },
    );
  };
  const readRecents = async () => {
    if (isLoaded) return;

    await queryRecents({ isExclusive: true });
  };
  // Opening a resource changes which rows are newest, and only the server knows the resulting order
  const refreshRecents = async () => {
    isLoaded = false;
    await queryRecents();
  };
  return { error, isLoading, readRecents, recents, refreshRecents };
});
