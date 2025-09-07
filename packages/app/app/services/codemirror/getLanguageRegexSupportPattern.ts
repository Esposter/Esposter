export const getLanguageRegexSupportPattern = (supportedExtensions: string): RegExp =>
  new RegExp(
    supportedExtensions.includes("^")
      ? supportedExtensions.replaceAll(/\|(\^)?/g, (_, b) => `$|${b ? "^" : String.raw`^.*\.`}$`)
      : `^.*\\.(${supportedExtensions})$`,
  );
