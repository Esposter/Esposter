import type { Card } from "#src/models/Card";

import { CONTEXT_HEADLINE_PREFIX } from "#src/services/constants";
import { formatCard } from "#src/services/formatCard";
import { describe, expect, test } from "vitest";

describe(formatCard, () => {
  const greeting = "greeting";
  const headline = "headline";

  // A verb prints this to one stream the model and the person both read, so the greeting in it is the resolved
  // One the welcome shows — the interface language's where that language has written it — and never the card's own
  test("greets in the resolved line rather than the authored one", () => {
    expect.hasAssertions();

    const card: Card = {
      description: "",
      greeting,
      headline,
      note: "",
      personaCard: { greeting: "authoredGreeting", habits: ["habit"], signOff: "signOff", verbs: [] },
    };

    expect(formatCard(card)).toBe(
      `${CONTEXT_HEADLINE_PREFIX}${headline}\n- habit\n- Greets: ${greeting}\n- Signs off: signOff`,
    );
  });
});
