import type { PersonaCard } from "#src/models/PersonaCard";

// The person's half of a card in another language: of what a card holds, only what a person reads — the greeting
// The welcome shows and the gerunds the spinner shows. The habits and the sign-off reach the model alone and stay
// As written. Each field is present once it is translated, so a language fills a character in as many passes as
// It takes, and a character with neither has no entry at all
export interface LocalizedPersonaCard extends Partial<Pick<PersonaCard, "greeting" | "verbs">> {}
