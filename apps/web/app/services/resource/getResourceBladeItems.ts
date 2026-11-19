import type { PortableFormat } from "#src/models/resource/PortableFormat";
import type { Item } from "#src/models/shared/Item";
import type { ResourceInResource } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { PortableFormatKind } from "#src/models/resource/PortableFormatKind";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { createPortableFormatItems } from "#src/services/resource/createPortableFormatItems";
import { getResourceEditDeleteItems } from "#src/services/resource/getResourceEditDeleteItems";

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
      delete: () => Promisable<void>;
      duplicate: () => Promisable<void>;
      exportDatasetCsv: () => Promisable<void>;
      read: () => Promisable<void>;
      rename: () => Promisable<void>;
      unpublish: () => Promisable<void>;
      versionHistory: () => Promisable<void>;
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
  const [renameItem, deleteItem] = getResourceEditDeleteItems({ onDelete: commands.delete, onEdit: commands.rename });

  return [
    { disabled: isPending, meaning: UiIconMeaning.Refresh, onClick: commands.read, title: "Refresh" },
    renameItem,
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
    { ...deleteItem, isGroupStart: true },
  ];
};
