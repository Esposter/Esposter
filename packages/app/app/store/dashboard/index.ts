import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";

export const useDashboardStore = defineStore("dashboard", () => {
  const { $trpc } = useNuxtApp();
  const {
    content: dashboard,
    createResource,
    currentResource,
    deleteResource,
    load,
    loadLocal,
    publication,
    publish: publishDashboard,
    renameResource,
    resources,
    save: saveDashboard,
    selectResource,
    setCurrentResource,
    unpublish: unpublishDashboard,
  } = useResourceState(
    Dashboard,
    {
      createResource: (input) => $trpc.dashboard.createResource.mutate(input),
      deleteResource: (input) => $trpc.dashboard.deleteResource.mutate(input),
      publishResource: (input) => $trpc.dashboard.publishResource.mutate(input),
      readResourceContent: (input) => $trpc.dashboard.readResourceContent.query(input),
      readResourcePublication: (input) => $trpc.dashboard.readResourcePublication.query(input),
      readResources: async () => (await $trpc.dashboard.readResources.query()).items,
      saveResourceContent: (input) => $trpc.dashboard.saveResourceContent.mutate(input),
      unpublishResource: (input) => $trpc.dashboard.unpublishResource.mutate(input),
      updateResource: (input) => $trpc.dashboard.updateResource.mutate(input),
    },
    { defaultName: "My Dashboard", localStorageKey: DASHBOARD_LOCAL_STORAGE_KEY, schema: dashboardSchema },
  );
  return {
    createResource,
    currentResource,
    dashboard,
    deleteResource,
    load,
    loadLocal,
    publication,
    publishDashboard,
    renameResource,
    resources,
    saveDashboard,
    selectResource,
    setCurrentResource,
    unpublishDashboard,
  };
});
