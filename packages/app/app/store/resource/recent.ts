import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { CacheTag } from "@/models/cache/CacheTag";
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { RECENT_RESOURCES_LIMIT } from "@/services/resource/constants";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";

// Recent means recently *opened*, and the set is the caller's own server-side access rows, so it follows them
// Between devices. Home's card and the search dropdown both want the same capped list and both mount on the
// Explorer home page, so the set is read once and two concurrent mounts share the in-flight query rather than
// Each issuing the same request.
export const useRecentStore = defineStore("resource/recent", () => {
  const { $trpc } = useNuxtApp();
  const recents = ref<ResourceListItem[]>([]);
  const error = ref("");
  const { isPending, read: readRecents } = useCachedRead(
    () => {
      // Taken from the source registry rather than restated, so what Recent means is one edit everywhere
      const { filter, sortBy } = ResourceListSourceDefinitionMap[ResourceListSource.Recents];
      return $trpc.resource.readResources.query({ ...filter, limit: RECENT_RESOURCES_LIMIT, sortBy: [...sortBy] });
    },
    {
      // Surfaced on the card as an inline alert with its own Retry rather than a toast: the card is the only
      // Thing that failed, and it has the room to say so
      onError: (readError) => {
        error.value = readError.message;
      },
      onSuccess: ({ items }) => {
        recents.value = items;
        error.value = "";
      },
      // Recents for the visit that reorders the list, Resources because a delete or a restore changes which of
      // Its rows still resolve. Neither moment has anything showing the list mounted — you are on the resource
      // Itself, or on the workbench table — so this drops and Home's card issues the read on its next mount
      tags: [CacheTag.Recents, CacheTag.Resources],
    },
  );
  return { error, isPending, readRecents, recents };
});
