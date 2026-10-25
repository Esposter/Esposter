import type { PortableFormat } from "@/models/resource/PortableFormat";
import type { Item } from "@/models/shared/Item";
import type { ResourceInResource } from "@esposter/db-schema";

import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { PortableFormatKind } from "@/models/resource/PortableFormatKind";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { createPortableFormatItems } from "@/services/resource/createPortableFormatItems";
import { getDeleteResourceItem } from "@/services/resource/getDeleteResourceItem";
import { getRenameResourceItem } from "@/services/resource/getRenameResourceItem";

// The overflow menu of a resource's blade header, in the order it shows. The header's lead action and its publish
// Button are not here, so the menu and the right-click of the title are the one list and never disagree
export const getResourceBladeItems = (
  resource: ResourceInResource,
  {
    commands,
    exportFormats,
    importFormats,
    isDuplicatePending,
    isPending,
    isPublicationPending,
    isPublished,
  }: {
    commands: {
      delete: () => void;
      duplicate: () => void;
      exportDatasetCsv: () => void;
      read: () => void;
      rename: () => void;
      unpublish: () => void;
      versionHistory: () => void;
    };
    exportFormats: PortableFormat[];
    importFormats: PortableFormat[];
    isDuplicatePending: boolean;
    isPending: boolean;
    isPublicationPending: boolean;
    isPublished: boolean;
  },
): Item[] => {
  // A dataset a portable export already covers keeps that export, so the CSV command is for the rest
  const isDatasetExportable =
    checkHasCapability(resource.type, "datasetProvider") && !checkHasCapability(resource.type, "portable");

  return [
    { disabled: isPending, meaning: UiIconMeaning.Refresh, onClick: commands.read, title: "Refresh" },
    getRenameResourceItem(commands.rename),
    { disabled: isDuplicatePending, meaning: UiIconMeaning.Copy, onClick: commands.duplicate, title: "Duplicate" },
    // Every type has revisions, so the command is unconditional — recovery is core rather than a capability.
    // Taking one is not a command at all: revisions accrue on their own, and a Save beside an editor that
    // Already persists on its own would read as the thing that makes an edit durable
    { isGroupStart: true, meaning: UiIconMeaning.Recent, onClick: commands.versionHistory, title: "Version history" },
    ...(isPublished
      ? [
          {
            disabled: isPublicationPending,
            isGroupStart: true,
            meaning: UiIconMeaning.Publish,
            onClick: commands.unpublish,
            title: "Unpublish",
          },
        ]
      : []),
    ...createPortableFormatItems("Import", UiIconMeaning.Upload, importFormats, PortableFormatKind.Import),
    ...createPortableFormatItems("Export", UiIconMeaning.Download, exportFormats, PortableFormatKind.Export),
    ...(isDatasetExportable
      ? [
          {
            isGroupStart: true,
            meaning: UiIconMeaning.Download,
            onClick: commands.exportDatasetCsv,
            title: "Export CSV",
          },
        ]
      : []),
    { ...getDeleteResourceItem(commands.delete), isGroupStart: true },
  ];
};
