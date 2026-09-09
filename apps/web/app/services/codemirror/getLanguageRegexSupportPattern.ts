export const getLanguageRegexSupportPattern = (supportedExtensions: string): RegExp =>
  new RegExp(
    supportedExtensions.includes("^")
      ? supportedExtensions.replaceAll(
          /\|(?<caret>\^)?/gu,
          (_match, caret: string | undefined) => `$|${caret ? "^" : String.raw`^.*\.`}$`,
        )
      : `^.*\\.(${supportedExtensions})$`,
    "u",
  );
