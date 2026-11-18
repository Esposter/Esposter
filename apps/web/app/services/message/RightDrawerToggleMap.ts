import { RightDrawer } from "#src/models/message/RightDrawer";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

// The panes the room header toggles, in the order its buttons stand, each with the name and mark its button and its row
// In a phone's room menu share
export const RightDrawerToggleMap = {
  [RightDrawer.Threads]: { drawer: RightDrawer.Threads, meaning: UiIconMeaning.Thread, title: "Followed Threads" },
  [RightDrawer.Search]: { drawer: RightDrawer.Search, meaning: UiIconMeaning.Search, title: "Search" },
  [RightDrawer.Member]: { drawer: RightDrawer.Member, meaning: UiIconMeaning.Members, title: "Member List" },
} as const satisfies { [TDrawer in RightDrawer]?: { drawer: TDrawer; meaning: UiIconMeaning; title: string } };
