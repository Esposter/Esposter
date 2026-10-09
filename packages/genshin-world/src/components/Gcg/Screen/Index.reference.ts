import type { ComponentReference } from "genshin-interface";

import { boardTopic } from "#src/components/Gcg/Screen/Board.reference";
import { GameSourceKind } from "genshin-interface";

// The duel board's reference: the public frame it is judged against, the community's tables its opponents and cards come
// From, and its one topic, the board, with what every investigation found and what is still open. The frame is a video's,
// So its words and marks are read off the frame and never shipped
export const reference: ComponentReference = {
  sources: {
    boardFrame: {
      capture: "gcg-yt-tvboQ_ZWO_I-400-410.mp4",
      kind: GameSourceKind.Capture,
      name: "Genshin Impact Walkthrough Part 2211, Genius Invokation TCG (tvboQ_ZWO_I, English PC client)",
      parityReference: "gcg-duel-board",
      role: "The board as the game lays it out in the Action Phase, both sides' characters, the dice column and the hand",
    },
    gameTable: {
      kind: GameSourceKind.DataTable,
      name: "GCGGameExcelConfigData, the row of game 12",
      role: "The opponent's deck (deck 1) and the player's deck the game names (deck 2, unbuilt) the duel's games slice reads",
      table: "ExcelBinOutput/GCGGameExcelConfigData.json",
    },
  },
  topics: { board: boardTopic },
};
