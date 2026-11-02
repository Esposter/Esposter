import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// Where the quest screen's pieces stand, their sizes, fills and marks, read off the wiki's still at its own resolution,
// One of its pixels a unit
export const layoutTopic: ReferenceTopic = {
  investigations: [
    {
      method: "Each piece's edges off the still with `genshin:parity zoom` and `measure`, and its colours by pixel",
      outcome: InvestigationOutcome.Found,
      result:
        "A band 95 high across the top; the tabs 96 wide from 720, the open one's cream disc 62 across at 17 in and its gold line 4 high along its foot; the close button a cream disc 46 across in a grey ring 58 across, 19 from the top and 48 from the right; the list from 105 to 955, 666 wide from 150; quest rows 76 high and 13 apart; a heading 56 high, 10 under the row above and 3 over the row below; a series' row 85 high with a blue bar 5 wide, its quests on a paler panel 8 in from each side, 12 under its top, 13 over its foot and 10 apart, the next series 19 under it; the details 899 wide from 877, the title's capitals at 128.5, the journal ending at 1711, a divider at 218, the objective's bar from 241 to 297, the description's capitals at 319 with lines 30 apart, a divider at 773 and the reward tiles 94 across, 110.5 apart, from 831; a line at 963, and both buttons 288 by 62 at 989, Quest Overview from 144 and the navigating one from 1512",
    },
    {
      method:
        "Each line's size from its capitals' height, the stand-in font's capitals being 0.683 of its size (Signika's cap height of 1366 in 2000 units)",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The list's title 27; a commission's title 26 and a series' quest's 27, their distances 18; a heading 27; a series' title 28 and its region 23; the details' title 35, the journal 26, the objective 26 and the description 27; both buttons 27",
    },
    {
      method:
        "Each line's ink width off the still against the stand-in face's at the same capitals, the face letter-spaced out to the still's width (interface.md): the details' title, journal, objective and first description line measured by eye at 1:1 against the fixture's render",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The title spaced 2.17 units, the journal 1.15 and set 61 in from the right (63 left its line 2 units short of the still's end), the objective 1.4 and the description 0.96. The description's measure is 880 units, not the 899 its box holds, so its first line breaks after Graeae as the still does: at 899 it broke after so, and at 860 the same 0.96 spacing wraps Graeae onto the next line. With these spacings the details' mean falls from 21.34 to 20.96. A title at 2.5 lowered the mean but lost shape, so it stays near 2",
    },
    {
      method:
        "Each translucent fill fitted against the world beside it, per channel as fill = alpha · colour + (1 − alpha) · world, over hundreds of columns: the rows against the gaps between them, the series' row against the world over it, the band against the world under its edge",
      outcome: InvestigationOutcome.Found,
      result:
        "The quest rows rgb(54 67 86 / 0.77), the commissions' fitting 0.76 and a series' quests' 0.78 in the same colour; a series' row rgb(45 58 74 / 0.85); the band rgb(30 29 45 / 0.4); a series' panel near white at 0.14, its two side strips fitting different values",
    },
    {
      method:
        'The marks traced with `genshin:parity trace "File:Quest Screen.png"` at four to six times from each mark\'s box at full resolution',
      outcome: InvestigationOutcome.Found,
      result:
        "The banner, the five tabs' marks, a series' chevron, the place's and a quest row's pins, the objective's ring and core, the overview's mark and the close button's X, the cream disc's dark hole. The four lists' marks have paler parts the ink share of 0.5 drops, so each is traced again at 0.2 for its whole mark, drawn under its bright parts at 0.3, the share read off the still as 0.24 to 0.4",
    },
    {
      method: "The commission row's star against the Commission tab's mark",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The same star at 0.89 of the tab's size, its ink 44 across: drawn as the tab's whole mark in the star's dark purple (#5e478c) under its bright parts in its light purple (#c1a1ff), rather than the wiki's own icon file, which is not shipped",
    },
    {
      method:
        "The world behind the screen, the 6.3 clip's world 0.9 seconds in against its quest screen 2.8 seconds in, the world blurred and fitted as screen = k · world + b band by band, clear of the screen's own pieces and the world's HUD; the fit is a measurement only, and the page draws the frame as captured, its interface pieces filled from their surroundings, with no blur or colour fit added",
      outcome: InvestigationOutcome.Found,
      result:
        "The screen keeps about 0.65 of the blurred world and adds a wash that brightens down the screen, b 0.15 at 340 high, 0.25 at 660, 0.30 at 820 and 0.35 at 980, each band's error under 0.02",
    },
    {
      method:
        "Drawing that blur and wash on the screen itself, as a backdrop-filter layer in GameScreen behind the screen's own pieces, the list's top band drawn over it",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The layer blurs the world with a 16 unit blur and keeps 0.65 of it, the wash added as light down the screen. On the parity page the four quest ids' means are their rows in `ParityReferenceMap.snapshot.md`. The blur radius moves the mean by under 0.2 between 10 and 24 units. The page's plate is the world the layer blurs, and the layer reproduces 0.65 times the plate plus the wash to within a few levels per band. The header keeps the overview clip's frame as its plate, which is darker than the still's world on the strip 340 high, so its remaining gap is the plate's, not the layer's",
    },
    {
      method:
        "The overview clip's plate against the still's own pixels as the plate, the whole screen and the list each with their pieces filled from the world round them, the header with its band filled from the world below it",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The whole screen 9.54% to 8.31% (shape 0.844 to 0.891, FLIP 0.3506 to 0.2996) and the list 6.18% to 5.12% (shape 0.892 to 0.910, FLIP 0.2657 to 0.2270), both kept as measurements, since the still's world is the one the reference shows. The header rose 3.37% to 4.09%, the still's band sitting darker than the world under it, so the header keeps the overview clip. The layer blurred and washed the still's plate again, the still's own wash applied twice, so the whole screen's bottom row read brighter than the still, 151 against 106 in its worst cells; the parity page now draws no world blur or wash over a backdrop that is the reference's own frame (`&backdropBlurred`, set for an entry with no `plateSource`), which takes the whole screen to 2.11% (shape 0.941), the list to 3.16% and the details to 1.34%, the header's unblurred overview world keeping the layer and 3.37%",
    },
    {
      method:
        "The reward tiles' edge strips, 5 pixels wide over the 60 above their count strip, and the strip's own mean colour, sampled off the still at 1 to 1 with ImageMagick, against the quest's rarity gradients and the translucent slate laid over each face",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The three, four and five star tiles' edge means (86 121 158), (126 105 164) and (172 115 53), within 4, 7 and 2 levels of their gradients' averages, so the quest's faces stand, and ItemTile's default faces run 11 to 31 levels lighter, so the quest takes the variant. The count strip's mean on a three star face, (74 95 119), is rgb(70 82 101 / 0.73) over that face's foot within 2 levels, against the default's opaque strip per rarity, so the variant draws it translucent. The count's size is 20 units on a 94 tile",
    },
    {
      method: "The screen's own words in the installed client's English text map",
      outcome: InvestigationOutcome.Found,
      result:
        "Quest Overview is UI_QUESTHUB_BUTTON_NAME, Cancel Navigation TASK_TRACK_CLEAR and each list's heading its TASK_TYPE line. In Progress and a distance's {0}m have no line named for the quest screen, so the plainest In Progress (UI_TEXT_DOING) and the Miliastra editor's metre length {0}m (UI_BEYOND_EDITOR_PROTOTYPE_LINE_METER) stand in, provisionally. The rewards' caption, Complete the quest series to unlock … and obtain rewards, is in no line the install holds",
    },
    {
      method:
        "The list's rows against the still's, the first commission row's title and figures read at 4 times: the list opening at its top sits 65 lower than the still, which is scrolled down to its commissions",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The fixture opens the list 65 units down (`listScroll`), so the commissions sit where the still has them and the Commission Quests heading is cut above the list's top, as in the still",
    },
  ],
  openQuestions: [
    "Whether the commissions' heading is Commission Quests under the Commission tab's mark, as the World Quests heading is the World tab's",
    "The blue bar with a white diamond along the first quest of each series: what it marks is not known, so it is not drawn",
    "The selected row's look: the still shows no selected row, so the selected one is ringed in the game's cream",
    "The rewards' caption's line, which the install's text map does not hold, so it is not drawn",
    "Whether a world quest in no series lists before or after the series, which the still does not show",
    "The art not drawn: the region's on a series' row, the journal's emblem and each reward's item",
    "The list's scroll bar and arrows",
    "The screen's RectTransforms from the client's blocks, which would place the pieces from the game's own tree rather than by measure",
  ],
};
