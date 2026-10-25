import type { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import type { PortableFormat } from "@/models/resource/PortableFormat";

import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { DataSourceTypeItemCategoryDefinitionMap } from "@/services/resource/sheet/dataSource/DataSourceTypeItemCategoryDefinitionMap";
import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";
import { trimFileExtension } from "@/util/file/trimFileExtension";

// Per-format import/export for Sheet. Both hand off to the dialog the blade shell mounts rather than acting
// Outright: an import shows what it is about to replace the sheet with, and an export asks which columns to take
// And honours the row filter and selection. The command bar is the single place a sheet is imported to or
// Exported from
export const createSheetPortableFormat = (type: DataSourceType): PortableFormat => ({
  export: async () => {
    // Named before the first await, so the dialog opens for the sheet the command was run on
    const resourceStore = useResourceStore();
    const resourceId = resourceStore.currentResourceId;
    const sheetStore = useSheetStore();
    const { loadContent } = sheetStore;
    // The command bar is reachable from any blade, so the content may not be loaded yet
    await loadContent();
    const sheetPortableDialogStore = useSheetPortableDialogStore();
    const { openExport } = sheetPortableDialogStore;
    openExport(resourceId, type);
  },
  icon: DataSourceTypeItemCategoryDefinitionMap[type].icon,
  import: async () => {
    const resourceStore = useResourceStore();
    const resourceId = resourceStore.currentResourceId;
    const sheetStore = useSheetStore();
    const { loadContent } = sheetStore;
    await loadContent();
    const configuration = DataSourceConfigurationMap[type];
    // A format other than the sheet's own is read with that format's defaults rather than rewriting the settings
    // The sheet already has — the same fallback the export dialog makes
    const settings = sheetStore.settings.type === type ? sheetStore.settings : createDefaultSheetSettings(type);
    const importFile = useImportFile();
    const sheetPortableDialogStore = useSheetPortableDialogStore();
    const { openPreview } = sheetPortableDialogStore;
    await importFile(configuration.mimeType, configuration.accept, async (file) => {
      const dataSource = await configuration.deserialize(file, settings);
      openPreview(resourceId, dataSource, trimFileExtension(dataSource.metadata.name));
    });
  },
  label: type,
});
