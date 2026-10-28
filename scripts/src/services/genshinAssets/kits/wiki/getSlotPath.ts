import { WikiTitlePath } from "#src/models/genshinAssets/kits/wiki/WikiTitlePath";
import { KitPlunge } from "genshin-world";

const NORMAL_ATTACK_TITLE_REGEX = /^Normal Attack (?<strike>\d+)(?:-Hit)?(?: (?<hit>[A-Z]))?$/u;
const CHARGED_ATTACK_TITLE_REGEX =
  /^(?:Charged Attack(?: (?:(?<number>\d+)-Hit|(?<letter>[A-Z])))?|Fully-Charged Aimed Shot)$/u;
const HIT_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// The plunges' rows by their titles
const WikiTitlePathMap: Partial<Record<string, string>> = {
  [WikiTitlePath.HighPlunge]: `plunges.${KitPlunge.High}.hits.0`,
  [WikiTitlePath.LowPlunge]: `plunges.${KitPlunge.Low}.hits.0`,
  [WikiTitlePath.PlungingAttackCollision]: "plungeCollision",
};

// The record path a normal attack's, charged attack's or plunge's row titled as given fills, `normalAttacks.0.hits.0`
// For `Normal Attack 1-Hit`, or undefined where the title is none of them
export const getSlotPath = (title: string): string | undefined => {
  const normalGroups = NORMAL_ATTACK_TITLE_REGEX.exec(title)?.groups;
  if (normalGroups?.strike !== undefined) {
    const hitIndex = normalGroups.hit === undefined ? 0 : HIT_LETTERS.indexOf(normalGroups.hit);
    return `normalAttacks.${Number(normalGroups.strike) - 1}.hits.${hitIndex}`;
  }
  const chargedGroups = CHARGED_ATTACK_TITLE_REGEX.exec(title)?.groups;
  if (chargedGroups !== undefined) {
    const hitIndex =
      chargedGroups.number === undefined
        ? chargedGroups.letter === undefined
          ? 0
          : HIT_LETTERS.indexOf(chargedGroups.letter)
        : Number(chargedGroups.number) - 1;
    return `chargedAttack.hits.${hitIndex}`;
  }
  return WikiTitlePathMap[title];
};
