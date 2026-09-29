import type { ResourceInResource } from "@esposter/db-schema";

import { useActivityStore } from "@/store/resource/activity";

export const useReadActivities = (id: ResourceInResource["id"]) => {
  const { $trpc } = useNuxtApp();
  const activityStore = useActivityStore();
  const { readItems, readMoreItems } = activityStore;
  const readActivities = () => readItems(() => $trpc.resource.readActivities.query({ id }));
  const readMoreActivities = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.resource.readActivities.query({ cursor, id }), onComplete);
  return { readActivities, readMoreActivities };
};
