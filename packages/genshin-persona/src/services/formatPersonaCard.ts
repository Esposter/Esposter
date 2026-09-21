import type { PersonaCard } from "#src/models/PersonaCard";

// The half of a card the model reads. The greeting is taken rather than read off the card, because the card holds
// The line as authored and the one that shows is the interface language's where that language has written it: the
// Welcome and this print the same greeting or the plugin speaks two. The verbs and the voice are absent by
// Construction rather than by a filter, because they are not in the lines this builds
export const formatPersonaCard = ({ habits, signOff }: PersonaCard, greeting: string): string =>
  [...habits.map((habit) => `- ${habit}`), `- Greets: ${greeting}`, `- Signs off: ${signOff}`].join("\n");
