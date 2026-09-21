import type { Card } from "#src/models/Card";

import { CONTEXT_HEADLINE_PREFIX } from "#src/services/constants";
import { formatCard } from "#src/services/formatCard";
import { describe, expect, test } from "vitest";

describe(formatCard, () => {
  const greeting = "greeting";
  const headline = "headline";

  // This block is the model's, and it is one block in one language: English habits, an English sign-off and the
  // Card's own greeting between them. The interface language's line is the welcome's alone, off the same card's
  // Resolved field, so a language that has written one never lands a second script in the middle of this
  test("greets in the card's own line rather than the welcome's resolved one", () => {
    expect.hasAssertions();

    const card: Card = {
      description: "",
      greeting: "resolvedGreeting",
      headline,
      note: "",
      personaCard: { greeting, habits: ["habit"], signOff: "signOff", verbs: [] },
    };

    expect(formatCard(card)).toBe(
      `${CONTEXT_HEADLINE_PREFIX}${headline}\n- habit\n- Greets: ${greeting}\n- Signs off: signOff`,
    );
  });
});
