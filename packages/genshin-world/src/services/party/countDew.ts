import type { Party } from "#src/models/party/Party";

// The Dew a party holds, its Verdant Dew and its Moonridge Dew, as gcsim's Dew counts both
export const countDew = ({ moonridgeDew, verdantDew }: Party): number => verdantDew.count + moonridgeDew;
