import { readSceneScriptChunk } from "#src/services/genshinAssets/scene/readSceneScriptChunk";
import { flattenLuaFunctions } from "#src/services/lua/flattenLuaFunctions";
import { GENSHIN_LUA_53 } from "#src/services/lua/GENSHIN_LUA_53";
import { proposeLuaOpcodeMapping } from "#src/services/lua/proposeLuaOpcodeMapping";
import { readLuaOpcodeName } from "#src/services/lua/readLuaOpcodeName";
import { readLuaOpcodeStatistics } from "#src/services/lua/readLuaOpcodeStatistics";

// The six-bit opcode field's every number, the ones a chunk never uses listed as unknown rather than guessed
const OPCODE_FIELD_COUNT = 64;

const formatRange = (minimum: number, maximum: number): string => `${minimum}..${maximum}`;

// A report on a raw scene script's instructions read without a mapping: each opcode number's operand ranges, how often
// Its B and C carry the constant flag, and the stock opcode the constraints give it, with the constraint that decided it
export const formatLuaDialectReport = async (file: string): Promise<string> => {
  const luaFunction = await readSceneScriptChunk(file, GENSHIN_LUA_53);
  const functionCount = flattenLuaFunctions(luaFunction).length;
  const statistics = readLuaOpcodeStatistics(luaFunction);
  const proposals = proposeLuaOpcodeMapping(statistics, functionCount);
  const seenOpcodes = new Set(statistics.map((statistic) => statistic.opcode));
  const unseenOpcodes = Array.from({ length: OPCODE_FIELD_COUNT }, (_value, opcode) => opcode).filter(
    (opcode) => !seenOpcodes.has(opcode),
  );
  const rows = proposals.map(({ evidence, statistic, stockOpcode }) => {
    const stockName = stockOpcode === undefined ? "unknown" : readLuaOpcodeName(stockOpcode);
    return [
      `opcode ${statistic.opcode}: ${statistic.count} instructions`,
      `  A ${formatRange(statistic.aMin, statistic.aMax)}, B ${formatRange(statistic.bMin, statistic.bMax)}, C ${formatRange(statistic.cMin, statistic.cMax)}, Bx ${formatRange(statistic.bxMin, statistic.bxMax)}`,
      `  constant flag: B ${statistic.rkBCount}, C ${statistic.rkCCount}; Bx below its constants ${statistic.bxBelowConstantsCount}`,
      `  -> ${stockName}: ${evidence}`,
    ].join("\n");
  });
  return [
    `${file}: ${functionCount} functions, ${luaFunction.instructions.length} instructions in the main function`,
    ...rows,
    `never seen, unknown: ${unseenOpcodes.join(" ")}`,
  ].join("\n");
};
