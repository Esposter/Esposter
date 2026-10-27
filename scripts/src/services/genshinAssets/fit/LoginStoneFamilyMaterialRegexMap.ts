import { LoginStoneFamilyMaterialRegex } from "#src/models/genshinAssets/fit/LoginStoneFamilyMaterialRegex";

// Each family of the login's parts by the materials it draws with, as the materials are named, and the door's frame
// And its panel each by its own, which glow apart
export const LoginStoneFamilyMaterialRegexMap: Record<LoginStoneFamilyMaterialRegex, RegExp> = {
  [LoginStoneFamilyMaterialRegex.Bridges]: /^LoginScene_(?:Bridge0[2-4]|Pillar|Broken)/u,
  [LoginStoneFamilyMaterialRegex.Door]: /^LoginScene_Door01/u,
  [LoginStoneFamilyMaterialRegex.DoorPanel]: /^LoginScene_Door02/u,
  [LoginStoneFamilyMaterialRegex.Towers]: /^LoginScene_Build/u,
  [LoginStoneFamilyMaterialRegex.Walkway]: /^LoginScene_Bridge01/u,
};
