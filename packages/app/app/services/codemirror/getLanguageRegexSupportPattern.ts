export const getLanguageRegexSupportPattern = (supportedExtensions: string): RegExp =>
  new RegExp(
    supportedExtensions.includes("^")
      ? supportedExtensions.replaceAll(
          new RegExp(String.raw`\|(\^)?`, "gu"),
          (_, b) => `$|${b ? "^" : String.raw`^.*\.`}$`,
        )
      : `^.*\\.(${supportedExtensions})$`,
    "u",
  );
