export const getFontFaces = () => {
  const fontFaceRules: CSSFontFaceRule[] = [];
  const readRules = (rules: CSSRuleList) => {
    for (const rule of rules)
      if (rule.cssText.startsWith("@font-face")) fontFaceRules.push(rule as CSSFontFaceRule);
      else if ("cssRules" in rule) readRules((rule as CSSGroupingRule).cssRules);
  };
  for (const styleSheet of window.document.styleSheets) {
    if (styleSheet.href && new URL(styleSheet.href).origin !== window.location.origin) continue;
    readRules(styleSheet.cssRules);
  }
  return fontFaceRules;
};
