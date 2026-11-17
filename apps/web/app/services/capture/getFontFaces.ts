import { checkIsFontFaceRule } from "#src/services/capture/checkIsFontFaceRule";
import { checkIsGroupingRule } from "#src/services/capture/checkIsGroupingRule";

export const getFontFaces = () => {
  const fontFaceRules: CSSFontFaceRule[] = [];
  const readRules = (rules: CSSRuleList) => {
    for (const rule of rules)
      if (checkIsFontFaceRule(rule)) fontFaceRules.push(rule);
      else if (checkIsGroupingRule(rule)) readRules(rule.cssRules);
  };
  for (const styleSheet of window.document.styleSheets) {
    if (styleSheet.href && new URL(styleSheet.href).origin !== window.location.origin) continue;
    readRules(styleSheet.cssRules);
  }
  return fontFaceRules;
};
