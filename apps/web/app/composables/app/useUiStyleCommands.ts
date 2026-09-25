import type { UiCommand } from "@/models/ui/UiCommand";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStyle, UiStyles } from "@/models/ui/UiStyle";
import { STYLE_COMMAND_GROUP } from "@/services/app/constants";
import { UiStyleIconMeaningMap } from "@/services/ui/UiStyleIconMeaningMap";
import { useReadableTextStore } from "@/store/ui/readableText";
import { useUiStyleStore } from "@/store/ui/style";
import { capitalize } from "@esposter/shared";

// The design styles, which the dock's style menu lists and the palette offers by name: a choice, so every style is
// Listed with the chosen one marked, and after them what only the chosen style has
export const useUiStyleCommands = () => {
  const readableTextStore = useReadableTextStore();
  const { toggleReadableText } = readableTextStore;
  const { isReadableText } = storeToRefs(readableTextStore);
  const uiStyleStore = useUiStyleStore();
  const { uiStyle } = storeToRefs(uiStyleStore);
  return computed<UiCommand[]>(() => [
    ...UiStyles.map((style) => ({
      group: STYLE_COMMAND_GROUP,
      id: `${STYLE_COMMAND_GROUP}${style}`,
      isSelected: style === uiStyle.value,
      meaning: UiStyleIconMeaningMap[style],
      run: () => {
        uiStyle.value = style;
      },
      title: capitalize(style),
    })),
    // Only the voxel style's body face is a pixel one, so the setting is offered only while it is drawn; its cookie
    // Stays, so switching back restores it
    ...(uiStyle.value === UiStyle.Voxel
      ? [
          {
            description: isReadableText.value ? "On" : "Off",
            group: STYLE_COMMAND_GROUP,
            id: "readable-text",
            meaning: UiIconMeaning.ReadableText,
            run: () => {
              toggleReadableText();
            },
            title: "Readable text",
          },
        ]
      : []),
  ]);
};
