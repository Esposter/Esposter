// The glob forms the excluded paths use, turned into a regex over a repository-relative path: `**/` takes any directory
// chain, `/**` at the end takes everything under a directory, `*` takes one path segment, and every other character is
// itself. `scripts` depends on no glob library, and these patterns need no more than this.
const GLOB_TOKEN_REGEX = /\/\*\*$|\*\*\/|\*\*|\*|[.+^${}()|[\]\?]/gu;

const GLOB_TOKEN_SOURCES: Record<string, string> = { "*": "[^/]*", "**": ".*", "**/": "(?:.*/)?", "/**": "/.*" };

export const globToRegex = (glob: string): RegExp => {
  const source = glob.replaceAll(GLOB_TOKEN_REGEX, (token) => GLOB_TOKEN_SOURCES[token] ?? `\\${token}`);
  return new RegExp(`^${source}$`, "u");
};
