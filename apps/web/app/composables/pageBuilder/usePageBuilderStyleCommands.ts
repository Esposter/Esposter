import type { UiCommand } from "@/models/ui/UiCommand";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PAGE_BUILDER_COMMAND_GROUP } from "@/services/pageBuilder/constants";

// Copy style and Paste style for one open resource's selected node, listed in the command palette beside the edits
export const usePageBuilderStyleCommands = (resourceId: MaybeRefOrGetter<string>) => {
  const { copyStyle, pasteStyle } = usePageBuilderStyle(resourceId);

  useCommands((): UiCommand[] => [
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-copy-style",
      meaning: UiIconMeaning.Copy,
      run: copyStyle,
      title: "Copy style",
    },
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-paste-style",
      meaning: UiIconMeaning.Paste,
      run: pasteStyle,
      title: "Paste style",
    },
  ]);
};
