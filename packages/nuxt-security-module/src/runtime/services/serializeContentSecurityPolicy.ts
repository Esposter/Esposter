import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";

// One `directive source…;` per directive.
// `upgrade-insecure-requests` is the only directive written without sources.
// A `false` directive is left out, and a directive with no sources left is written with none
export const serializeContentSecurityPolicy = (policy: ContentSecurityPolicy): string =>
  Object.entries(policy)
    .filter(([, value]) => value !== false)
    .map(([directive, value]) => {
      if (directive === "upgrade-insecure-requests") return "upgrade-insecure-requests;";

      const sources = Array.isArray(value) ? value.map((source) => source.trim()).join(" ") : "";
      return `${directive} ${sources};`;
    })
    .join(" ");
