import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
// The import/export commands live on the blade command bar, which is reachable from every blade — so the dialogs
// They open cannot live in the Data blade alone. This holds what each one is opened with, and
// ResourceSheetDialogs (mounted by the blade shell) renders them wherever the reader happens to be
export const useSheetPortableDialogStore = defineStore("resource/sheet/portableDialog", () => {
  const previewDataSource = ref<DataSource | undefined>();
  const previewName = ref("");
  const exportDataSourceType = ref(DataSourceType.Csv);
  const isExportOpen = ref(false);
  const isSurveyImportOpen = ref(false);
  const isPreviewOpen = computed({
    get: () => Boolean(previewDataSource.value),
    set: (newIsPreviewOpen) => {
      if (!newIsPreviewOpen) previewDataSource.value = undefined;
    },
  });
  const openExport = (type: DataSourceType) => {
    exportDataSourceType.value = type;
    isExportOpen.value = true;
  };
  const openPreview = (dataSource: DataSource, name: string) => {
    previewName.value = name;
    previewDataSource.value = dataSource;
  };
  const openSurveyImport = () => {
    isSurveyImportOpen.value = true;
  };
  return {
    exportDataSourceType,
    isExportOpen,
    isPreviewOpen,
    isSurveyImportOpen,
    openExport,
    openPreview,
    openSurveyImport,
    previewDataSource,
    previewName,
  };
});
