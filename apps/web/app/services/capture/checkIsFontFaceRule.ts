// A rule is narrowed by the test that identifies it: here, its text as a font face
export const checkIsFontFaceRule = (rule: CSSRule): rule is CSSFontFaceRule => rule.cssText.startsWith("@font-face");
