export const getLanguageRegexSupportPattern = (supportedExtensions: string): RegExp =>
  new RegExp(
    supportedExtensions.includes("^")
      ? supportedExtensions.replaceAll(/\|(\^)?/gu, (_, b) => `$|${b ? "^" : String.raw`^.*\.`}$`)
      : `^.*\\.(${supportedExtensions})$`,
    "u",
  );
