import type { PortableFormat } from "@/models/resource/PortableFormat";
import type { Item } from "@/models/shared/Item";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// One command per format, named by its verb and the format, the first opening its group: a submenu is a second
// Aim the pointer has to hold, where a flat group is read at a glance
export const createPortableFormatItems = (
  verb: string,
  meaning: UiIconMeaning,
  formats: PortableFormat[],
  kind: "export" | "import",
): Item[] =>
  formats.map((format, index) => ({
    isGroupStart: index === 0,
    meaning,
    onClick: () => format[kind]?.(),
    title: `${verb} ${format.label}`,
  }));
