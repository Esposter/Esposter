import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

// The Traveler's behaviour: her skill's hit deals the element of the statue she resonated with last, not the Anemo her
// Record names, and her burst's hit already deals her wielder's, since it names none. Her strikes, charged attack and
// Plunges are her record's alone. The kit of every character without a module of its own
export const createTravelerKitBehaviour = (): KitBehaviour => ({ skill: { hits: [{ takesWielderElement: true }] } });
