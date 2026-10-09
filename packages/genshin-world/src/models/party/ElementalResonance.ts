import type { Element } from "#src/models/Element";
import type { SpecialResonance } from "#src/models/party/SpecialResonance";

// A resonance a deployed team gives: an element two of its members share, or a special resonance
export type ElementalResonance = Element | SpecialResonance;
