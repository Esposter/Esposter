export const getLanguageRegexSupportPattern = (supportedExtensions: string) =>
  supportedExtensions.includes("^")
    ? supportedExtensions.replaceAll(/\|(\^)?/g, (_, b) => `$|${b ? "^" : "^.*\\."}$`)
    : `^.*\\.(${supportedExtensions})$`;
