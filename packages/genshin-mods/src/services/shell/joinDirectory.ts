const ROOT_REGEX = /^(?:[a-zA-Z]:)?[/\\]/u;
const SEPARATOR_REGEX = /[/\\]/u;

// The folder `next` names from `base`: `next` itself where it is absolute, else the two joined, each `.` dropped and
// Each `..` taking the folder before it, so a path read off a command compares with the paths the ward records
export const joinDirectory = (base: string, next: string): string => {
  if (next === "") return base;
  const path = ROOT_REGEX.test(next) || base === "" ? next : `${base}/${next}`;
  const root = ROOT_REGEX.exec(path)?.[0] ?? "";
  const segments: string[] = [];
  for (const segment of path.slice(root.length).split(SEPARATOR_REGEX))
    if (segment === "" || segment === ".") continue;
    else if (segment !== "..") segments.push(segment);
    else if (segments.length > 0 && segments.at(-1) !== "..") segments.pop();
    else if (root === "") segments.push(segment);
  return `${root.replace("\\", "/")}${segments.join("/")}`;
};
