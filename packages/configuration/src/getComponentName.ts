// A folder's own component, named by the folder
const FOLDER_COMPONENT_NAME = "Index";
const toPascalCase = (segment: string): string =>
  segment
    .split(/[-_]/u)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join("");
// A component's name from its path under `components`, as Nuxt names the app's: its folders and its file joined in
// PascalCase, a folder's `Index.vue` named by the folder, and a leading part a segment already starts with dropped,
// So `Login/Screen.vue` and `Login/LoginScreen.vue` are both `LoginScreen`
export const getComponentName = (path: string): string => {
  const segments = path
    .replaceAll("\\", "/")
    .replace(/\.vue$/u, "")
    .split("/")
    .map((segment) => toPascalCase(segment));
  if (segments.length > 1 && segments.at(-1) === FOLDER_COMPONENT_NAME) segments.pop();
  return segments.reduce(
    (name, segment) => (segment.toLowerCase().startsWith(name.toLowerCase()) ? segment : `${name}${segment}`),
    "",
  );
};
