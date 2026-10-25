import { getOpenSpecOwners } from "#src/services/openspec/getOpenSpecOwners";
import { getSkillName } from "#src/services/sweeps/skillDocs/getSkillName";

// A skill's `SKILL.md` restates each of its reference pages by design — the index line names the trigger the page
// Opens on, and an always-on rule is the page's rule in one line — so that pair is one owner. Two reference pages
// Are two owners even inside one skill: each is the single statement of its topic, so a run they share is a copy. Two
// OpenSpec pages are one owner when they state one capability or one change (`getOpenSpecOwners`)
export const checkIsOneOwner = (firstPath: string, secondPath: string): boolean => {
  const skillName = getSkillName(firstPath);
  const secondOwners = getOpenSpecOwners(secondPath);
  return (
    (skillName !== "" &&
      skillName === getSkillName(secondPath) &&
      (firstPath.endsWith("/SKILL.md") || secondPath.endsWith("/SKILL.md"))) ||
    getOpenSpecOwners(firstPath).some((owner) => secondOwners.includes(owner))
  );
};
