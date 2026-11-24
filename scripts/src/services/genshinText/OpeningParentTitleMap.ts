import { QuestId } from "genshin-world/definitions";

// The named prerequisites of each city's opening quest, by the title the fandom wiki's Commission page gives them,
// Under the region the page names them for. Provisional: the page names them in prose, not as data. The builder matches
// Each title to the dump by its English text. Left out: Liyue's "New Horizons of Adventure", Inazuma's "Katheryne in
// Inazuma" and Sumeru's "Adventure Takes Courage! (World Quest)", which name each opening's own world quest, and
// Sumeru's reset, which no quest records. The dump files Liyue's chapter, "For a Tomorrow Without Tears", under
// Mondstadt (city 1), so that gate is unconfirmed source: https://genshin-impact.fandom.com/wiki/Commission (the Liyue,
// Inazuma and Sumeru sections)
export const OpeningParentTitleMap: Partial<Record<QuestId, { region: string; titles: string[] }>> = {
  [QuestId.InazumaOpening]: { region: "Inazuma", titles: ["Ritou Escape Plan"] },
  [QuestId.LiyueOpening]: { region: "Liyue", titles: ["For a Tomorrow Without Tears"] },
  [QuestId.SumeruOpening]: { region: "Sumeru", titles: ["The Morn a Thousand Roses Brings"] },
};
