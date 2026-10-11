import type { ComponentReference } from "genshin-interface";

import { layoutTopic } from "#src/components/Quest/Screen/Layout.reference";
import { GameSourceKind } from "genshin-interface";

// The quest screen's reference: the wiki's still it is judged against, the public clip its world behind it was read
// From, and its one topic, the layout, with what every investigation found and what is still open
export const reference: ComponentReference = {
  sources: {
    overviewClip: {
      capture: "yt-2_e7S_J9yAA-quest-overview.mp4",
      kind: GameSourceKind.Capture,
      name: "The 6.3 Quest Overview showcase (2_e7S_J9yAA, English PC client at 1080p60)",
      role: "The world just before J, 0.9 seconds in, and the quest screen over it with no quest in progress, 2.8 seconds in",
    },
    screenStill: {
      kind: GameSourceKind.Capture,
      name: "File:Quest Screen.png",
      parityReference: "quest-screen",
      role: "The English PC client's quest screen at 1920 by 1080 on its In Progress tab, its list scrolled down to three commissions and two Snezhnaya series, a world quest selected and navigated to",
    },
  },
  topics: { layout: layoutTopic },
};
