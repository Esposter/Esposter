import type { DecodedCurve } from "#src/models/genshinAssets/shared/DecodedCurve";

// The properties an interface clip moves, by the Unity property a curve drives: an alpha as opacity, a Transform's
// Scale by its x, and an anchored position's offset in canvas units, its y running up the screen
export const toProperty = ({ component, property }: DecodedCurve): string => {
  if (property === "m_Alpha" || property === "m_Color.a") return "opacity";
  if (property === "scale" && component === "x") return "scale";
  if (property === "m_AnchoredPosition.x") return "x";
  if (property === "m_AnchoredPosition.y") return "y";
  else return "";
};
