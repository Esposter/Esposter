import type { PersonaCard } from "#src/models/PersonaCard";

// The half of a card the model reads. The verbs and the voice are absent by construction rather than by
// A filter, because they are not in the lines this builds
export const formatPersonaCard = ({ greeting, habits, signOff }: PersonaCard): string =>
  [...habits.map((habit) => `- ${habit}`), `- Greets: ${greeting}`, `- Signs off: ${signOff}`].join("\n");
