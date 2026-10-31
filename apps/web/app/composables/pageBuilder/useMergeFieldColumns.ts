import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

// The column names of the dataset the email is bound to, which its merge fields are offered from, or none while it binds none
export const useMergeFieldColumns = (resourceId: MaybeRefOrGetter<string>) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getMergeFieldColumnsRef } = pageBuilderDocumentStore;
  return getMergeFieldColumnsRef(resourceId);
};
