// A dynamic `import()` of a JSON file, with the `type: "json"` attribute Node needs to load it. Vite's dev server
// Serves the file as a JavaScript module and strips only a static import's attribute, so the browser refuses a
// Dynamic one for its type
const DYNAMIC_JSON_IMPORT_REGEX =
  /(?<specifier>import\(\s*["'][^"']+\.json["'])\s*,\s*\{\s*with:\s*\{\s*type:\s*"json"\s*\}\s*\}\s*\)/gu;

export const removeDynamicJsonImportAttributes = (code: string): string =>
  code.replaceAll(DYNAMIC_JSON_IMPORT_REGEX, "$<specifier>)");
