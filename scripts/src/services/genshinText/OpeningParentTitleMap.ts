import { QuestId } from "genshin-world";

// The named prerequisites of each city's opening quest, by the title the fandom wiki's Commission page gives them, under the
// Region the page names them for. Provisional: the page names them in prose, not as data. The builder matches each title to
// The dump by its English text. Left out: Liyue's "New Horizons of Adventure", Inazuma's "Katheryne in Inazuma" and Sumeru's
// "Adventure Takes Courage! (World Quest)", which name each opening's own world quest, and Sumeru's reset, which no quest
// Records. The dump files Liyue's chapter, "For a Tomorrow Without Tears", under Mondstadt (city 1), so that gate is unconfirmed
// Source: https://genshin-impact.fandom.com/wiki/Commission (the Liyue, Inazuma and Sumeru sections)
export const OpeningParentTitleMap: Partial<Record<QuestId, { region: string; titles: string[] }>> = {
  [QuestId.InazumaOpening]: { region: "Inazuma", titles: ["Ritou Escape Plan"] },
  [QuestId.LiyueOpening]: { region: "Liyue", titles: ["For a Tomorrow Without Tears"] },
  [QuestId.SumeruOpening]: { region: "Sumeru", titles: ["The Morn a Thousand Roses Brings"] },
};
