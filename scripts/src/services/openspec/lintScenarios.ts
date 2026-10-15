interface ScenarioBlock {
  keywords: string[];
  line: number;
  title: string;
}

const SCENARIO_HEADING_REGEX = /^####\s+Scenario:\s*(?<title>.*)$/u;
const HEADING_REGEX = /^#{1,4}\s/u;
const STEP_REGEX = /^-\s+\*\*(?<keyword>GIVEN|WHEN|THEN|AND)\*\*\s+\S/u;
// One behaviour per scenario: an optional GIVEN, one WHEN, one THEN. AND may follow any step, so it is ignored here.
const SEQUENCE_REGEX = /^(?:GIVEN )?WHEN THEN$/u;

const checkScenario = (path: string, { keywords, line, title }: ScenarioBlock): string[] => {
  const sequence = keywords.filter((keyword) => keyword !== "AND").join(" ");
  if (SEQUENCE_REGEX.test(sequence)) return [];
  return [`${path}:${line}: scenario "${title}" must read GIVEN? WHEN THEN, found "${sequence}"`];
};

// Returns one finding per broken scenario or stray line, formatted `path:line: message`. A scenario ends at the next
// Heading of any level, so requirement bodies and the prose around them are never read as steps.
export const lintScenarios = (path: string, markdown: string): string[] => {
  const findings: string[] = [];
  let scenario: ScenarioBlock | undefined;

  for (const [index, text] of markdown.split(/\r?\n/u).entries()) {
    const line = index + 1;
    const heading = SCENARIO_HEADING_REGEX.exec(text);
    if (scenario && (heading || HEADING_REGEX.test(text))) {
      findings.push(...checkScenario(path, scenario));
      scenario = undefined;
    }
    if (heading) scenario = { keywords: [], line, title: (heading.groups?.title ?? "").trim() };
    else if (scenario && text.trim() !== "") {
      const step = STEP_REGEX.exec(text);
      const keyword = step?.groups?.keyword;
      if (keyword) scenario.keywords.push(keyword);
      else findings.push(`${path}:${line}: scenario "${scenario.title}" holds prose; use "- **WHEN** ..." steps only`);
    }
  }
  if (scenario) findings.push(...checkScenario(path, scenario));

  return findings;
};
