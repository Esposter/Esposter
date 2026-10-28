import type { BankReader } from "#src/models/genshinAssets/music/BankReader";
import type { WwiseCurve } from "#src/models/genshinAssets/music/WwiseCurve";

export const readCurves = (reader: BankReader): WwiseCurve[] =>
  // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- a curve's interpolation, parameter and scaling codes are kept as the bank holds them, since a throw on one unknown code would abort the whole bank parse that readGameMixVolumes.ts:35 runs through parseWwiseNode (parseWwiseNode.ts:50 and :89 call this)
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
