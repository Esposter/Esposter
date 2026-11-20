import { LoginStoneFamily } from "#src/models/genshinAssets/fit/LoginStoneFamily";

// Each family of the login's parts by the materials it draws with, as the materials are named, and the door's frame
// And its panel each by its own, which glow apart
export const LoginStoneFamilyMaterialRegexMap: Record<LoginStoneFamily, RegExp> = {
  [LoginStoneFamily.Bridges]: /^LoginScene_(?:Bridge0[2-4]|Pillar|Broken)/u,
  [LoginStoneFamily.Door]: /^LoginScene_Door01/u,
  [LoginStoneFamily.DoorPanel]: /^LoginScene_Door02/u,
  [LoginStoneFamily.Towers]: /^LoginScene_Build/u,
  [LoginStoneFamily.Walkway]: /^LoginScene_Bridge01/u,
};
