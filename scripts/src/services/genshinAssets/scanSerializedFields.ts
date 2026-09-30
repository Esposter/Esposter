import type { ObjectPointer } from "#src/models/genshinAssets/ObjectPointer";
import type { SerializedField } from "#src/models/genshinAssets/SerializedField";

import { SerializedFieldKind } from "#src/models/genshinAssets/SerializedFieldKind";

type Reader = (offset: number) => undefined | { end: number; field: SerializedField };

const WORD = 4;
const POINTER_BYTES = 12;
// A MonoBehaviour's own fields lead its bytes: its game object and its script as pointers, its enabled flag aligned to
// Four bytes between them, then its name, a length and that many characters aligned to four
const NAME_LENGTH_OFFSET = 28;
const KEYFRAME_WORDS = 4;
const WEIGHTED_KEYFRAME_WORDS = 7;
const GRADIENT_KEYS = 8;
const GRADIENT_BYTES = GRADIENT_KEYS * 16 + GRADIENT_KEYS * 2 * 2 + WORD + WORD;
// The widest a count, a curve's keys and an array's records are read as, past which a word is some other field
const MAX_COUNT = 1024;
// The largest whole number read as an integer rather than a float's bits: a count, an enum, a flag or a layer mask
const MAX_INTEGER = 1 << 20;
// A float nearer zero than this, or farther than the largest, is some other field's bits; a colour's channel may be
// Brighter than one where it is lit, never by more than this
const MIN_MAGNITUDE = 1e-5;
const MAX_MAGNITUDE = 1e7;
const MAX_COLOR_CHANNEL = 16;
// Unity's wrap modes (default, once, loop, ping-pong, clamp forever) and its rotation orders, which end a curve
const MAX_WRAP_MODE = 8;
const MAX_ROTATION_ORDER = 5;
const MAX_WEIGHTED_MODE = 3;
const MAX_GRADIENT_MODE = 2;
const GRADIENT_TIME_SCALE = 65_535;

const checkIsPlausible = (value: number): boolean =>
  value === 0 || (Number.isFinite(value) && Math.abs(value) >= MIN_MAGNITUDE && Math.abs(value) <= MAX_MAGNITUDE);
const checkIsSorted = (times: readonly number[]): boolean =>
  times.every((time, index) => index === 0 || time >= (times[index - 1] ?? 0));
const checkIsChannel = (value: number, max: number): boolean => value === 0 || (value >= MIN_MAGNITUDE && value <= max);
// A script's fields read from its raw serialized bytes without its type data, by the shapes they take. Unity writes a
// Script's fields in the order they are declared, each aligned to four bytes, with no names, so each offset from the
// Header on is read as the first shape that fits it: a pointer the component's data holds (the check says which do), a
// Curve, an array of records of one shape, a gradient, a colour, and last a scalar. A reading is a candidate until a
// Scene's use of it is checked against the captures, and a test on its offset then holds it
export const scanSerializedFields = (
  bytes: Buffer,
  checkIsPointer: (pointer: ObjectPointer) => boolean,
): SerializedField[] => {
  const wordCount = Math.floor(bytes.length / WORD);
  const readInt = (offset: number): number => bytes.readInt32LE(offset);
  const readFloat = (offset: number): number => bytes.readFloatLE(offset);
  const hasBytes = (offset: number, count: number): boolean => offset + count <= wordCount * WORD;
  const readPointer: Reader = (offset) => {
    if (!hasBytes(offset, POINTER_BYTES)) return undefined;
    const pointer = { fileIndex: readInt(offset), pathId: bytes.readBigInt64LE(offset + WORD).toString() };
    return pointer.pathId !== "0" && checkIsPointer(pointer)
      ? { end: offset + POINTER_BYTES, field: { kind: SerializedFieldKind.Pointer, offset, pointer } }
      : undefined;
  };
  // A curve whose keyframes are the given number of words: time, value and two slopes, then in Unity's own layout a
  // Weighted mode and two weights, which this game's scripts leave out
  const readCurveOf = (keyframeWords: number, offset: number): ReturnType<Reader> => {
    const count = readInt(offset);
    const end = offset + WORD + count * keyframeWords * WORD + 3 * WORD;
    if (count < 1 || count > MAX_COUNT || !hasBytes(offset, end - offset)) return undefined;
    const keys: Extract<SerializedField, { kind: SerializedFieldKind.Curve }>["keys"] = [];
    for (let index = 0; index < count; index++) {
      const key = offset + WORD + index * keyframeWords * WORD;
      const [time = 0, value = 0, inSlope = 0, outSlope = 0] = [0, 1, 2, 3].map((word) => readFloat(key + word * WORD));
      const isWeighted = keyframeWords === WEIGHTED_KEYFRAME_WORDS;
      const weightedMode = isWeighted ? readInt(key + 4 * WORD) : 0;
      const weights = isWeighted ? [readFloat(key + 5 * WORD), readFloat(key + 6 * WORD)] : [];
      if (
        ![time, value, ...weights].every((word) => checkIsPlausible(word)) ||
        // A slope may be infinite, where a curve steps
        Number.isNaN(inSlope) ||
        Number.isNaN(outSlope) ||
        weightedMode < 0 ||
        weightedMode > MAX_WEIGHTED_MODE ||
        (keys.length > 0 && time < (keys.at(-1)?.time ?? 0))
      )
        return undefined;
      keys.push({ inSlope, outSlope, time, value });
    }
    const [preWrap = -1, postWrap = -1, rotationOrder = -1] = [0, 1, 2].map((word) =>
      readInt(end - 3 * WORD + word * WORD),
    );
    return [preWrap, postWrap].every((mode) => mode >= 0 && mode <= MAX_WRAP_MODE) &&
      rotationOrder >= 0 &&
      rotationOrder <= MAX_ROTATION_ORDER
      ? { end, field: { keys, kind: SerializedFieldKind.Curve, offset } }
      : undefined;
  };
  const readCurve: Reader = (offset) =>
    readCurveOf(WEIGHTED_KEYFRAME_WORDS, offset) ?? readCurveOf(KEYFRAME_WORDS, offset);
  const readGradient: Reader = (offset) => {
    if (!hasBytes(offset, GRADIENT_BYTES)) return undefined;
    const timesOffset = offset + GRADIENT_KEYS * 16;
    const alphaTimesOffset = timesOffset + GRADIENT_KEYS * 2;
    const modeOffset = alphaTimesOffset + GRADIENT_KEYS * 2;
    const mode = readInt(modeOffset);
    const colorKeyCount = bytes.readUInt8(modeOffset + WORD);
    const alphaKeyCount = bytes.readUInt8(modeOffset + WORD + 1);
    if (
      mode < 0 ||
      mode > MAX_GRADIENT_MODE ||
      colorKeyCount < 1 ||
      colorKeyCount > GRADIENT_KEYS ||
      alphaKeyCount < 1 ||
      alphaKeyCount > GRADIENT_KEYS
    )
      return undefined;
    const readTimes = (start: number, count: number): number[] =>
      Array.from({ length: count }, (_, index) => bytes.readUInt16LE(start + index * 2) / GRADIENT_TIME_SCALE);
    const colorTimes = readTimes(timesOffset, colorKeyCount);
    const alphaTimes = readTimes(alphaTimesOffset, alphaKeyCount);
    const colors = Array.from({ length: Math.max(colorKeyCount, alphaKeyCount) }, (_, index) =>
      [0, 1, 2, 3].map((channel) => readFloat(offset + index * 16 + channel * WORD)),
    );
    if (
      !checkIsSorted(colorTimes) ||
      !checkIsSorted(alphaTimes) ||
      !colors.every((color) => color.every((channel) => checkIsChannel(channel, 1)))
    )
      return undefined;
    return {
      end: offset + GRADIENT_BYTES,
      field: {
        alphaKeys: alphaTimes.map((time, index) => ({ alpha: colors[index]?.[3] ?? 0, time })),
        colorKeys: colorTimes.map((time, index) => {
          const [red = 0, green = 0, blue = 0] = colors[index] ?? [];
          return { color: [red, green, blue], time };
        }),
        kind: SerializedFieldKind.Gradient,
        offset,
      },
    };
  };
  const readColor: Reader = (offset) => {
    if (!hasBytes(offset, 4 * WORD)) return undefined;
    const [red = 0, green = 0, blue = 0, alpha = 0] = [0, 1, 2, 3].map((word) => readFloat(offset + word * WORD));
    // Four zeros say nothing a scalar does not
    return [red, green, blue].every((channel) => checkIsChannel(channel, MAX_COLOR_CHANNEL)) &&
      checkIsChannel(alpha, 1) &&
      [red, green, blue, alpha].some((channel) => channel !== 0)
      ? { end: offset + 4 * WORD, field: { color: [red, green, blue, alpha], kind: SerializedFieldKind.Color, offset } }
      : undefined;
  };
  // An array of records of one shape: a count, then that many records every one of which that shape reads
  const readArray: Reader = (offset) => {
    const count = readInt(offset);
    if (count < 1 || count > MAX_COUNT) return undefined;
    for (const readElement of [readPointer, readCurve, readGradient, readColor]) {
      const elements: SerializedField[] = [];
      let end = offset + WORD;
      for (let index = 0; index < count && end < wordCount * WORD; index++) {
        const element = readElement(end);
        if (!element) break;
        elements.push(element.field);
        end = element.end;
      }
      if (elements.length === count) return { end, field: { elements, kind: SerializedFieldKind.Array, offset } };
    }
    return undefined;
  };
  const readScalar: Reader = (offset) => {
    const integer = readInt(offset);
    const float = readFloat(offset);
    const end = offset + WORD;
    if (Math.abs(integer) <= MAX_INTEGER)
      return { end, field: { kind: SerializedFieldKind.Integer, offset, value: integer } };
    return checkIsPlausible(float)
      ? { end, field: { kind: SerializedFieldKind.Float, offset, value: float } }
      : undefined;
  };
  const readers = [readPointer, readCurve, readArray, readGradient, readColor, readScalar];
  const fields: SerializedField[] = [];
  const nameLength = hasBytes(NAME_LENGTH_OFFSET, WORD) ? readInt(NAME_LENGTH_OFFSET) : 0;
  let offset = NAME_LENGTH_OFFSET + WORD + Math.ceil(nameLength / WORD) * WORD;
  while (hasBytes(offset, WORD)) {
    const start = offset;
    const read = readers
      .values()
      .map((reader) => reader(start))
      .find((result) => result !== undefined);
    if (read) fields.push(read.field);
    offset = read?.end ?? offset + WORD;
  }
  return fields;
};
