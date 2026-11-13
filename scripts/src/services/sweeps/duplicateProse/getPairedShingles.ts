import type { PairedShingle } from "#src/models/sweeps/duplicateProse/PairedShingle";

import { SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";
import { createSlotTable } from "#src/services/sweeps/duplicateProse/createSlotTable";
import { getOrCreate, InvalidOperationError, Operation } from "@esposter/shared";

// Two odd 32-bit bases, one per lane. A window of words is a polynomial of its word ids in each base, modulo 2^32 as
// Math.imul wraps it, so the next window is one subtraction, one multiplication and one addition from the last.
const FIRST_BASE = 0x9e3779b1;
const SECOND_BASE = 0x85ebca6b;
const STEM_SIZE = SHINGLE_SIZE - 1;
const LANE_SHIFT = 2 ** 21;
// The base raised to the power of the word that leaves the window, as the lane reads it
const getLeavingFactor = (base: number): number => {
  let factor = 1;
  for (let index = 0; index < STEM_SIZE; index++) factor = Math.imul(factor, base);
  return factor;
};
const FIRST_LEAVING_FACTOR = getLeavingFactor(FIRST_BASE);
const SECOND_LEAVING_FACTOR = getLeavingFactor(SECOND_BASE);

// A window's two lanes as one number below 2^53, which a Map keys as exactly as it would a string of the words
const getKey = (firstLane: number, secondLane: number): number => (firstLane >>> 0) * LANE_SHIFT + (secondLane >>> 11);

const checkIsSameWords = (
  firstIds: Uint32Array,
  firstIndex: number,
  secondIds: Uint32Array,
  secondIndex: number,
  size: number,
): boolean => {
  for (let offset = 0; offset < size; offset++)
    if (firstIds[firstIndex + offset] !== secondIds[secondIndex + offset]) return false;

  return true;
};

// The shingles — every window of `SHINGLE_SIZE` words — that exactly two pages hold and that are not a template plus
// A word, each at the first position it has on either page, in the order they first appear. A shingle on three or
// More pages is a template, and a shingle whose first or last `SHINGLE_SIZE - 1` words sit on three or more pages is
// A template with one word added, which whichever two pages happen to start the same way would share.
//
// A window is keyed by the hash of its word ids rather than by its text, since a corpus of millions of windows spends
// Its time allocating and collecting a hundred-character string for each. A key met again is checked against the words
// It was first met at, so a collision throws rather than merging two different windows.
export const getPairedShingles = (pageWords: Map<string, string[]>): PairedShingle[] => {
  const paths = [...pageWords.keys()];
  const wordIdMap = new Map<string, number>();
  const pageIds = [...pageWords.values()].map((words) =>
    Uint32Array.from(words, (word) => getOrCreate(wordIdMap, word, () => wordIdMap.size) + 1),
  );
  const windowCount = pageIds.reduce((count, ids) => count + ids.length, 0);

  // A stem is the first `SHINGLE_SIZE - 1` words of a shingle, held by as many pages as have it
  const stemTable = createSlotTable(windowCount);
  const stemPageCounts = new Uint32Array(windowCount);
  const stemLastPages = new Int32Array(windowCount);
  const stemFirstPages = new Int32Array(windowCount);
  const stemFirstIndexes = new Int32Array(windowCount);
  // The slot of the stem that starts at each position of each page, which the template check reads afterwards
  const pageStemSlots: Int32Array[] = [];
  const shingleTable = createSlotTable(windowCount);
  const shingleFirstPages = new Int32Array(windowCount);
  const shingleFirstIndexes = new Int32Array(windowCount);
  const shingleSecondPages = new Int32Array(windowCount);
  const shingleSecondIndexes = new Int32Array(windowCount);
  // How many pages hold the shingle, counted no higher than three since only exactly two is read
  const shinglePageCounts = new Uint8Array(windowCount);
  let stemSlotCount = 0;
  let shingleSlotCount = 0;

  for (const [pageIndex, ids] of pageIds.entries()) {
    const stemSlots = new Int32Array(ids.length);
    pageStemSlots.push(stemSlots);
    let firstLane = 0;
    let secondLane = 0;
    for (let index = 0; index < Math.min(STEM_SIZE, ids.length); index++) {
      firstLane = Math.imul(firstLane, FIRST_BASE) + (ids[index] ?? 0);
      secondLane = Math.imul(secondLane, SECOND_BASE) + (ids[index] ?? 0);
    }
    for (let index = 0; index + STEM_SIZE <= ids.length; index++) {
      const stemKey = getKey(firstLane, secondLane);
      let stemSlot = stemTable.get(stemKey);
      if (stemSlot === undefined) {
        stemSlot = stemSlotCount++;
        stemTable.set(stemKey, stemSlot);
        stemPageCounts[stemSlot] = 1;
        stemLastPages[stemSlot] = pageIndex;
        stemFirstPages[stemSlot] = pageIndex;
        stemFirstIndexes[stemSlot] = index;
      } else {
        if (
          !checkIsSameWords(
            pageIds[stemFirstPages[stemSlot] ?? 0] ?? ids,
            stemFirstIndexes[stemSlot] ?? 0,
            ids,
            index,
            STEM_SIZE,
          )
        )
          throw new InvalidOperationError(Operation.Read, "getPairedShingles", "two different stems share a hash");

        if (stemLastPages[stemSlot] !== pageIndex) {
          stemPageCounts[stemSlot] = (stemPageCounts[stemSlot] ?? 0) + 1;
          stemLastPages[stemSlot] = pageIndex;
        }
      }
      stemSlots[index] = stemSlot;

      // The last stem of a page has no word after it, so it starts no shingle
      const lastId = ids[index + STEM_SIZE];
      if (lastId === undefined) continue;

      const shingleFirstLane = Math.imul(firstLane, FIRST_BASE) + lastId;
      const shingleSecondLane = Math.imul(secondLane, SECOND_BASE) + lastId;
      const shingleKey = getKey(shingleFirstLane, shingleSecondLane);
      const shingleSlot = shingleTable.get(shingleKey);
      if (shingleSlot === undefined) {
        shingleTable.set(shingleKey, shingleSlotCount);
        shingleFirstPages[shingleSlotCount] = pageIndex;
        shingleFirstIndexes[shingleSlotCount] = index;
        shinglePageCounts[shingleSlotCount] = 1;
        shingleSlotCount++;
      } else {
        const firstPage = shingleFirstPages[shingleSlot] ?? 0;
        if (
          !checkIsSameWords(pageIds[firstPage] ?? ids, shingleFirstIndexes[shingleSlot] ?? 0, ids, index, SHINGLE_SIZE)
        )
          throw new InvalidOperationError(Operation.Read, "getPairedShingles", "two different shingles share a hash");

        // A page already holding the shingle keeps the first position it had there
        if (pageIndex !== firstPage && pageIndex !== shingleSecondPages[shingleSlot])
          if (shinglePageCounts[shingleSlot] === 1) {
            shingleSecondPages[shingleSlot] = pageIndex;
            shingleSecondIndexes[shingleSlot] = index;
            shinglePageCounts[shingleSlot] = 2;
          } else shinglePageCounts[shingleSlot] = 3;
      }

      // The window moves one word on: the first word leaves the stem, and the one past the stem joins it
      firstLane = shingleFirstLane - Math.imul(ids[index] ?? 0, FIRST_LEAVING_FACTOR);
      secondLane = shingleSecondLane - Math.imul(ids[index] ?? 0, SECOND_LEAVING_FACTOR);
    }
  }

  const pairedShingles: PairedShingle[] = [];
  for (let slot = 0; slot < shingleSlotCount; slot++) {
    if (shinglePageCounts[slot] !== 2) continue;

    const firstPage = shingleFirstPages[slot] ?? 0;
    const firstIndex = shingleFirstIndexes[slot] ?? 0;
    const stemSlots = pageStemSlots[firstPage] ?? new Int32Array();
    if (
      (stemPageCounts[stemSlots[firstIndex] ?? 0] ?? 0) > 2 ||
      (stemPageCounts[stemSlots[firstIndex + 1] ?? 0] ?? 0) > 2
    )
      continue;

    pairedShingles.push({
      firstIndex,
      firstPath: paths[firstPage] ?? "",
      secondIndex: shingleSecondIndexes[slot] ?? 0,
      secondPath: paths[shingleSecondPages[slot] ?? 0] ?? "",
    });
  }
  return pairedShingles;
};
