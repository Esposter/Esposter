const REQUIREMENT_REGEX = /^###\s+Requirement:\s*(?<title>.*)$/u;
const HEADING_REGEX = /^#{1,6}\s/u;
// A backticked path, or a backticked file name with a source's extension. A span holds no whitespace, so the text
// Between two spans is never read as a path. Scenarios are outside a requirement's body, so their citations are never
// Read here.
const SOURCE_PATH_REGEX = /`[^`\s]*(?:\/[^`\s]*|\.(?:cs|go|js|json|md|png|snap|ts|txt|vue))`/u;

// Returns one finding per requirement-body line that cites a source, formatted `path:line: message`. A requirement's body
// Ends at the next heading of any level, so a scenario's own citations and the design's Sources are never read as body.
export const lintRequirementSources = (path: string, markdown: string): string[] => {
  const findings: string[] = [];
  let requirement: string | undefined;

  for (const [index, text] of markdown.split(/\r?\n/u).entries()) {
    const requirementMatch = REQUIREMENT_REGEX.exec(text);
    if (requirementMatch?.groups) {
      requirement = requirementMatch.groups.title;
      continue;
    }
    if (HEADING_REGEX.test(text)) {
      requirement = undefined;
      continue;
    }
    if (requirement !== undefined && SOURCE_PATH_REGEX.test(text))
      findings.push(
        `${path}:${index + 1}: requirement "${requirement}" cites a source in its body; move the citation to the design's Sources or Key files`,
      );
  }

  return findings;
};
