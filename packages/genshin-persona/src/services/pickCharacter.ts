import type { BirthdayCandidate } from "#src/models/BirthdayCandidate";
import type { Character } from "#src/models/Character";
import type { MonthDay } from "#src/models/MonthDay";

import { getDaysUntil } from "#src/services/getDaysUntil";
import { parseMonthDay } from "#src/services/parseMonthDay";
import { hashString } from "#src/util/hashString";

// Whoever's birthday is nearest to today. A tie goes to the birthday still ahead over the one just passed, and
// What is left after that is one candidate per seed, so every session started on one day meets the same character
export const pickCharacter = (roster: Character[], today: MonthDay, seed: string): Character | undefined => {
  const candidates = roster.flatMap<BirthdayCandidate>((character) => {
    const birthday = parseMonthDay(character.birthday);
    if (!birthday) return [];

    const daysAhead = getDaysUntil(today, birthday);
    const daysBehind = getDaysUntil(birthday, today);
    return [{ character, distance: Math.min(daysAhead, daysBehind), isUpcoming: daysAhead <= daysBehind }];
  });
  if (candidates.length === 0) return undefined;

  const nearestDistance = Math.min(...candidates.map(({ distance }) => distance));
  const nearestCandidates = candidates.filter(({ distance }) => distance === nearestDistance);
  const upcomingCandidates = nearestCandidates.filter(({ isUpcoming }) => isUpcoming);
  const finalCandidates = (upcomingCandidates.length > 0 ? upcomingCandidates : nearestCandidates).toSorted((a, b) =>
    a.character.name.localeCompare(b.character.name),
  );
  const seededIndex = hashString(seed) % finalCandidates.length;
  return finalCandidates[seededIndex]?.character;
};
