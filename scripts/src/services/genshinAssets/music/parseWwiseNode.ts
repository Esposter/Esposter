import type { SoundBankObject } from "#src/models/genshinAssets/music/SoundBankObject";
import type { WwiseCurve } from "#src/models/genshinAssets/music/WwiseCurve";
import type { WwiseNode } from "#src/models/genshinAssets/music/WwiseNode";

import { BankReader } from "#src/models/genshinAssets/music/BankReader";
import { SoundBankObjectType } from "#src/models/genshinAssets/music/SoundBankObjectType";
import { exhaustiveGuard } from "@esposter/shared";

// A source's plugin, how it streams, its id, its size in memory and its bits
const SOURCE_LENGTH = 14;
// The type a source plugin's id carries in its low bits, whose parameters follow its source
const SOURCE_PLUGIN_TYPE = 2;
// A track's clip: its track index, its source, an event, then where it plays and its trims as doubles
const CLIP_LENGTH = 44;
// A node's effect in its slot: its index, its id, whether it is a share set and whether it is rendered
const EFFECT_LENGTH = 7;
// A bus's duck: the bus it ducks, the volume, its fades, its curve and the property it ducks
const DUCK_LENGTH = 18;
const readProperties = (reader: BankReader): Map<number, number> => {
  const ids = Array.from({ length: reader.readUInt8() }, () => reader.readUInt8());
  return new Map(ids.map((id) => [id, reader.readFloat()]));
};
const skipRangedProperties = (reader: BankReader): void => {
  const count = reader.readUInt8();
  reader.skip(count + count * 8);
};
const skipPositioning = (reader: BankReader): void => {
  const bits = reader.readUInt8();
  const isOverridingParent = Boolean(bits & 1);
  const isThreeDimensional = Boolean((bits >> 1) & 1);
  const positionType = (bits >> 5) & 3;
  if (!isOverridingParent || !isThreeDimensional) return;
  reader.skip(1);
  if (positionType === 0) return;
  // A path's mode and transition time, its vertices, then its play list's items and each item's ranges
  reader.skip(5);
  reader.skip(reader.readUInt32() * 16);
  const itemCount = reader.readUInt32();
  reader.skip(itemCount * 8 + itemCount * 12);
};
const skipAuxiliary = (reader: BankReader): void => {
  if ((reader.readUInt8() >> 3) & 1) reader.skip(16);
};
const skipStateChunk = (reader: BankReader): void => {
  for (let index = reader.readVariableUInt(); index > 0; index--) {
    reader.readVariableUInt();
    reader.skip(2);
  }
  for (let index = reader.readVariableUInt(); index > 0; index--) {
    reader.skip(5);
    reader.skip(reader.readVariableUInt() * 8);
  }
};
const readCurves = (reader: BankReader): WwiseCurve[] =>
  Array.from({ length: reader.readUInt16() }, () => {
    const gameParameterId = reader.readUInt32();
    const isGameParameter = reader.readUInt8() === 0;
    reader.skip(1);
    const parameter = reader.readVariableUInt();
    reader.skip(4);
    const scaling = reader.readUInt8();
    const points = Array.from({ length: reader.readUInt16() }, () => {
      const from = reader.readFloat();
      const to = reader.readFloat();
      return { from, interpolation: reader.readUInt32(), to };
    });
    return { gameParameterId, isGameParameter, parameter, points, scaling };
  });
const skipSource = (reader: BankReader): number => {
  const pluginId = reader.readUInt32();
  reader.skip(1);
  const sourceId = reader.readUInt32();
  reader.skip(SOURCE_LENGTH - 9);
  if ((pluginId & 0x0f) === SOURCE_PLUGIN_TYPE) reader.skip(reader.readUInt32());
  return sourceId;
};
// What a sound bank's node or bus says of how loud it plays, read as Wwise lays it out at bank version 134 (after
// Bnnm/wwiser's parser): a node's base parameters after whatever its kind keeps before them, and a bus's own fields,
// Its parent bus standing as its parent. Each game parameter's curve is kept for its default to be read; the states a
// Node holds are skipped, since every state group starts at none
export const parseWwiseNode = ({ data, type }: SoundBankObject): WwiseNode => {
  const reader = new BankReader(data);
  const sourceIds: number[] = [];
  switch (type) {
    case SoundBankObjectType.ActorMixer:
    case SoundBankObjectType.LayerContainer:
    case SoundBankObjectType.RandomSequenceContainer:
    case SoundBankObjectType.SwitchContainer:
      break;
    case SoundBankObjectType.AuxiliaryBus:
    case SoundBankObjectType.Bus: {
      const parentId = reader.readUInt32();
      // The master bus names its audio device
      if (parentId === 0) reader.skip(4);
      const properties = readProperties(reader);
      skipPositioning(reader);
      skipAuxiliary(reader);
      // Its limits and channel configuration, its recovery time and its largest duck
      reader.skip(16);
      reader.skip(reader.readUInt32() * DUCK_LENGTH);
      const effectCount = reader.readUInt8();
      if (effectCount > 0) reader.skip(1 + effectCount * EFFECT_LENGTH);
      // Its mixer plugin and whether that is a share set, then whether it overrides its attachments
      reader.skip(6);
      return { busId: 0, curves: readCurves(reader), parentId, properties, sourceIds };
    }
    case SoundBankObjectType.MusicPlaylist:
    case SoundBankObjectType.MusicSegment:
    case SoundBankObjectType.MusicSwitch:
      reader.skip(1);
      break;
    case SoundBankObjectType.MusicTrack: {
      reader.skip(1);
      for (let index = reader.readUInt32(); index > 0; index--) sourceIds.push(skipSource(reader));
      // Its clips, then its sub-track count, kept only beside a clip
      const clipCount = reader.readUInt32();
      if (clipCount > 0) reader.skip(clipCount * CLIP_LENGTH + 4);
      for (let index = reader.readUInt32(); index > 0; index--) {
        reader.skip(8);
        reader.skip(reader.readUInt32() * 12);
      }
      break;
    }
    case SoundBankObjectType.Sound:
      sourceIds.push(skipSource(reader));
      break;
    default:
      exhaustiveGuard(type);
  }
  reader.skip(1);
  const effectCount = reader.readUInt8();
  if (effectCount > 0) reader.skip(1 + effectCount * EFFECT_LENGTH);
  reader.skip(1);
  const busId = reader.readUInt32();
  const parentId = reader.readUInt32();
  reader.skip(1);
  const properties = readProperties(reader);
  skipRangedProperties(reader);
  skipPositioning(reader);
  skipAuxiliary(reader);
  // Its voice limits and virtual voice behaviour, and its envelope and loudness flags
  reader.skip(6);
  skipStateChunk(reader);
  return { busId, curves: readCurves(reader), parentId, properties, sourceIds };
};
