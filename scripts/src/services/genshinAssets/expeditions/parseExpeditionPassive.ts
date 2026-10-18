import type { ExpeditionPassive } from "genshin-world";
import type { Except } from "type-fest";

import { ExpeditionPassiveKind, ExpeditionRegion } from "genshin-world";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The two sentences the game writes an expedition talent's description in: a time talent names its region, and a reward
// Talent names its region and the hours its expedition runs for
const TIME_TALENT_PATTERN =
  /^When dispatched on an expedition in (?<region>[^,]+), time consumed is reduced by (?<percent>\d+)%\.$/u;
const REWARD_TALENT_PATTERN =
  /^Gains (?<percent>\d+)% more rewards when dispatched on an? (?<region>\S+) Expedition for (?<hours>\d+) hours\.$/u;

// The expedition talent a game description states, without its proud skill group, or undefined where the description names
// No expedition. A region the game names but the model does not hold is an error, since the talent would then never apply
export const parseExpeditionPassive = (
  description: string,
): Except<ExpeditionPassive, "proudSkillGroupId"> | undefined => {
  const timeMatch = TIME_TALENT_PATTERN.exec(description);
  const rewardMatch = timeMatch ? undefined : REWARD_TALENT_PATTERN.exec(description);
  const match = timeMatch ?? rewardMatch;
  if (!match?.groups) return undefined;
  const { hours, percent = "", region = "" } = match.groups;
  if (!Object.values<string>(ExpeditionRegion).includes(region))
    throw new InvalidOperationError(Operation.Read, description, `names the region ${region}`);
  const expeditionRegion = region as ExpeditionRegion;
  const percentValue = Number(percent);
  if (timeMatch) return { kind: ExpeditionPassiveKind.Time, percent: percentValue, region: expeditionRegion };
  return { hours: Number(hours), kind: ExpeditionPassiveKind.Reward, percent: percentValue, region: expeditionRegion };
};
