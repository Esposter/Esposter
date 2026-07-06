import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";

export const useDashboardStore = defineStore("dashboard", () => {
  const { $trpc } = useNuxtApp();
  const {
    content: dashboard,
    createDocument,
    currentDocument,
    deleteDocument,
    documents,
    load,
    loadLocal,
    publish: publishDashboard,
    renameDocument,
    save: saveDashboard,
    selectDocument,
    setCurrentDocument,
    unpublish: unpublishDashboard,
  } = useDocumentState(
    Dashboard,
    {
      createDocument: (input) => $trpc.dashboard.createDocument.mutate(input),
      deleteDocument: (input) => $trpc.dashboard.deleteDocument.mutate(input),
      publishDocument: (input) => $trpc.dashboard.publishDocument.mutate(input),
      readDocumentContent: (input) => $trpc.dashboard.readDocumentContent.query(input),
      readDocuments: async () => (await $trpc.dashboard.readDocuments.query({})).items,
      saveDocumentContent: (input) => $trpc.dashboard.saveDocumentContent.mutate(input),
      unpublishDocument: (input) => $trpc.dashboard.unpublishDocument.mutate(input),
      updateDocument: (input) => $trpc.dashboard.updateDocument.mutate(input),
    },
    { defaultName: "My Dashboard", localStorageKey: DASHBOARD_LOCAL_STORAGE_KEY, schema: dashboardSchema },
  );
  return {
    createDocument,
    currentDocument,
    dashboard,
    deleteDocument,
    documents,
    load,
    loadLocal,
    publishDashboard,
    renameDocument,
    saveDashboard,
    selectDocument,
    setCurrentDocument,
    unpublishDashboard,
  };
});
