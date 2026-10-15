interface ScenarioBlock {
  keywords: string[];
  line: number;
  title: string;
}

const SCENARIO_HEADING = /^####\s+Scenario:\s*(.*)$/;
const HEADING = /^#{1,4}\s/;
const STEP = /^-\s+\*\*(GIVEN|WHEN|THEN|AND)\*\*\s+\S/;
// One behaviour per scenario: an optional GIVEN, one WHEN, one THEN. AND may follow any step, so it is ignored here.
const SEQUENCE = /^(GIVEN )?WHEN THEN$/;

const checkScenario = (path: string, { keywords, line, title }: ScenarioBlock): string[] => {
  const sequence = keywords.filter((keyword) => keyword !== "AND").join(" ");
  if (SEQUENCE.test(sequence)) return [];
  return [`${path}:${line}: scenario "${title}" must read GIVEN? WHEN THEN, found "${sequence}"`];
};

// Returns one finding per broken scenario or stray line, formatted `path:line: message`. A scenario ends at the next
// heading of any level, so requirement bodies and the prose around them are never read as steps.
export const lintScenarios = (path: string, markdown: string): string[] => {
  const findings: string[] = [];
  let scenario: ScenarioBlock | undefined;

  for (const [index, text] of markdown.split(/\r?\n/).entries()) {
    const line = index + 1;
    const heading = SCENARIO_HEADING.exec(text);
    if (scenario && (heading || HEADING.test(text))) {
      findings.push(...checkScenario(path, scenario));
      scenario = undefined;
    }
    if (heading) scenario = { keywords: [], line, title: heading[1].trim() };
    else if (scenario && text.trim() !== "") {
      const step = STEP.exec(text);
      if (step) scenario.keywords.push(step[1]);
      else findings.push(`${path}:${line}: scenario "${scenario.title}" holds prose; use "- **WHEN** ..." steps only`);
    }
  }
  if (scenario) findings.push(...checkScenario(path, scenario));

  return findings;
};
