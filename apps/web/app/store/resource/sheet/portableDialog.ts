import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { useResourceStore } from "@/store/resource";
// The import/export commands live on the blade command bar, which is reachable from every blade, so the
// Dialogs they open cannot live in the Data blade alone. This holds what each one is opened with, and
// ResourceSheetDialogs (mounted by the blade shell) renders them wherever the reader happens to be.
// Keyed by the sheet a dialog was opened for: a file parsed or a sheet loaded after the reader moved to another
// Sheet is that sheet's import, and filed ambiently its preview would open over — and import into — the next one.
// Every open names its sheet, resolved where the command started rather than when its await lands
export const useSheetPortableDialogStore = defineStore("resource/sheet/portableDialog", () => {
  const resourceStore = useResourceStore();
  const getResourceId = () => resourceStore.currentResourceId;
  const { data: previewDataSource, getDataRef: getPreviewDataSourceRef } = useDataMap<DataSource | undefined>(
    getResourceId,
    undefined,
  );
  const { data: previewName, getDataRef: getPreviewNameRef } = useDataMap(getResourceId, "");
  const { data: exportDataSourceType, getDataRef: getExportDataSourceTypeRef } = useDataMap(
    getResourceId,
    DataSourceType.Csv,
  );
  const { data: isExportOpen, getDataRef: getIsExportOpenRef } = useDataMap(getResourceId, false);
  const { data: isSurveyImportOpen, getDataRef: getIsSurveyImportOpenRef } = useDataMap(getResourceId, false);
  const isPreviewOpen = computed({
    get: () => Boolean(previewDataSource.value),
    set: (newIsPreviewOpen) => {
      if (!newIsPreviewOpen) previewDataSource.value = undefined;
    },
  });
  const openExport = (resourceId: string, type: DataSourceType) => {
    const exportDataSourceTypeRef = getExportDataSourceTypeRef(resourceId);
    const isExportOpenRef = getIsExportOpenRef(resourceId);
    exportDataSourceTypeRef.value = type;
    isExportOpenRef.value = true;
  };
  const openPreview = (resourceId: string, dataSource: DataSource, name: string) => {
    const previewNameRef = getPreviewNameRef(resourceId);
    const previewDataSourceRef = getPreviewDataSourceRef(resourceId);
    previewNameRef.value = name;
    previewDataSourceRef.value = dataSource;
  };
  const closePreview = (resourceId: string) => {
    const previewDataSourceRef = getPreviewDataSourceRef(resourceId);
    previewDataSourceRef.value = undefined;
  };
  const openSurveyImport = (resourceId: string) => {
    const isSurveyImportOpenRef = getIsSurveyImportOpenRef(resourceId);
    isSurveyImportOpenRef.value = true;
  };
  const closeSurveyImport = (resourceId: string) => {
    const isSurveyImportOpenRef = getIsSurveyImportOpenRef(resourceId);
    isSurveyImportOpenRef.value = false;
  };
  return {
    closePreview,
    closeSurveyImport,
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
