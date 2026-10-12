import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { writeAvatar } from "#src/services/genshinAssets/avatar/writeAvatar";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const avatarCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component to write an avatar for: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Write a component's game model beside its exports as its avatar: the rig, its meshes and their materials",
    name: "avatar",
  },
  run: async ({ args }) => {
    console.log(await writeAvatar(parseDerivedAssetComponent(args.component)));
  },
});
