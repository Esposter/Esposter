import type { PortableFormat } from "@/models/resource/PortableFormat";
import type { PortableFormatKind } from "@/models/resource/PortableFormatKind";
import type { Item } from "@/models/shared/Item";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// A resource with several formats gets one command named by its verb, which opens the formats beneath it in the same
// Menu, each against its own icon: a flat row of "Import Csv" and "Export Csv" per format would bury the commands around
// Them. A lone format is the command itself, since a group of one is a click spent on nothing
export const createPortableFormatItems = (
  verb: string,
  meaning: UiIconMeaning,
  formats: PortableFormat[],
  kind: PortableFormatKind,
): Item[] => {
  const [format] = formats;
  if (!format) return [];

  if (formats.length === 1)
    return [{ isGroupStart: true, meaning, onClick: () => format[kind]?.(), title: `${verb} ${format.label}` }];

  return [
    {
      children: formats.map((child) => ({ icon: child.icon, onClick: () => child[kind]?.(), title: child.label })),
      isGroupStart: true,
      meaning,
      title: verb,
    },
  ];
};
