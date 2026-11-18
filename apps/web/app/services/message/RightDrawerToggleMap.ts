import { RightDrawer } from "#src/models/message/RightDrawer";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import type { RIGHT_DRAWER_TOGGLES } from "#src/services/message/constants";

type ToggleDrawer = (typeof RIGHT_DRAWER_TOGGLES)[number];

// The panes the room header toggles, each with the name and mark its button and its row in a phone's room menu share.
// The order the buttons stand in is `RIGHT_DRAWER_TOGGLES`, and the map holds exactly those panes
export const RightDrawerToggleMap = {
  [RightDrawer.Member]: { drawer: RightDrawer.Member, meaning: UiIconMeaning.Members, title: "Member List" },
  [RightDrawer.Search]: { drawer: RightDrawer.Search, meaning: UiIconMeaning.Search, title: "Search" },
  [RightDrawer.Threads]: { drawer: RightDrawer.Threads, meaning: UiIconMeaning.Thread, title: "Followed Threads" },
} as const satisfies Record<ToggleDrawer, { drawer: ToggleDrawer; meaning: UiIconMeaning; title: string }>;
