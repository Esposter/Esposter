import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The board's layout, its words and its state as the frame shows them. The frame is the video's at 1920 by 1080, read at
// Its own resolution: the characters' art is not drawn, so the board draws each card's tint and words only
export const boardTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "The wiki's full-size board image through the file search and the parse API; the image host answers a Cloudflare challenge to curl",
      outcome: InvestigationOutcome.DeadEnd,
      result: "No whole-frame image of the board is reachable from the wiki on this machine",
    },
    {
      method:
        "The public videos, yt-dlp at 1080p60 for the minutes of duels, then a frame at 407.0 seconds of tvboQ_ZWO_I, cut from 400 seconds",
      outcome: InvestigationOutcome.Found,
      result:
        "The Action Phase: the opponent's three characters at HP 6, 28 and 6 with the 28 raised in the middle; the player's three at 10 each with the first raised; eight dice (Electro 2, Hydro 1, Geo 2, Cryo 1, Pyro 1, Dendro 1) in a column down the right edge; five cards fanned along the bottom with dice costs 2, 3, 1, 2 and 0; the band across the centre reading Action Phase; the English words Now Acting and Battle 1/1",
    },
  ],
  openQuestions: [
    "The hourglass at centre-left and the gold 8 below it: the end-round control and the round or dice counter are not confirmed, so the board draws the end-round control and the round's words, which the frame does not show",
    "The characters' identity: the player's left card is read as Raiden Shogun from its art alone, and the opponent's cards are not named",
    "The energy pips are too small to count at 1080 high, so the fixture gives every character no energy",
    "The left panel with a trefoil icon, read as the player's support zone; no summons, supports or equipment are visible in the frame",
    "The round number: the frame shows no round words, so the fixture's round is the first",
    "The game's own duel of game 12 is not the frame's duel: the frame's opponent is not deck 1, and the player's cards are not deck 3's, so the fixture takes the frame's HP, dice and turn and the decks' names",
  ],
};
