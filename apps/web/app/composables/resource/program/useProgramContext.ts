import { useNotificationStore } from "@/store/notification";
import { useResourceStore } from "@/store/resource";
import { useProgramStore } from "@/store/resource/program";
import { getRouteParam } from "@/util/router/getRouteParam";

// The program page's route, stores and notifications, which the status blade and the invite export both read
export const useProgramContext = () => {
  const { currentRoute } = useRouter();
  const { $trpc } = useNuxtApp();
  const programStore = useProgramStore();
  const { programResource } = storeToRefs(programStore);
  const resourceStore = useResourceStore();
  const { resource } = storeToRefs(resourceStore);
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, createWarningNotification } = notificationStore;
  const id = computed(() => getRouteParam(currentRoute.value.params, "id"));

  return {
    $trpc,
    createErrorNotification,
    createNotification,
    createWarningNotification,
    id,
    programResource,
    resource,
  };
};
