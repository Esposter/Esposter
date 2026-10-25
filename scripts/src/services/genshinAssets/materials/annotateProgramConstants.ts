import type { ShaderConstant } from "#src/models/genshinAssets/materials/ShaderConstant";

import { checkIsDisjoint } from "#src/services/genshinAssets/materials/checkIsDisjoint";
import { computeRegisters } from "#src/services/genshinAssets/materials/computeRegisters";
import { COMPONENT_BYTES, REGISTER_BYTES } from "#src/services/genshinAssets/materials/constants";

const COMPONENTS = "xyzw";
// The first constant buffer's size as an assembly declares it, or as decompiled HLSL does where the program carries no
// Names of its own. A shader model 6 program's assembly declares the buffer's binding range first and reads each
// Register under the range's index, `cb0[0:0][size]` and `cb0[0][register]`
const BUFFER_SIZE_REGEX = /(?:dcl_constantbuffer cb0(?:\[\d+:\d+\])?|float4 cb0)\[(?<size>\d+)\]/iu;
const REGISTER_REGEX = /cb0(?:\[\d+\])?\[(?<register>\d+)\]/gu;

// A disassembled or decompiled program headed by what its first constant buffer's registers hold, named from the layout
// Of its shader's that fits it: one whose constants share no byte, that names every register the program reads and ends
// Within the buffer it declares, preferring the one that names the most. Without one that fits, the program is left as
// It is
export const annotateProgramConstants = (assembly: string, layouts: readonly ShaderConstant[][]): string => {
  const size = Number(BUFFER_SIZE_REGEX.exec(assembly)?.groups?.size ?? 0);
  if (size === 0) return assembly;
  // The registers it reads, its buffer's own declaration aside, which HLSL writes in the same form as a read
  const body = assembly.replace(BUFFER_SIZE_REGEX, "");
  const usedRegisters = new Set(Array.from(body.matchAll(REGISTER_REGEX), (match) => Number(match.groups?.register)));
  let best: ShaderConstant[] | undefined;
  let bestCount = 0;
  for (const layout of layouts) {
    const named = new Set(layout.flatMap((constant) => computeRegisters(constant)));
    const isFitting =
      checkIsDisjoint(layout) &&
      [...usedRegisters].every((register) => named.has(register)) &&
      Math.max(...named) < size;
    if (isFitting && layout.length > bestCount) {
      best = layout;
      bestCount = layout.length;
    }
  }
  if (!best) return assembly;
  const header = best
    .toSorted((firstConstant, secondConstant) => firstConstant.byteOffset - secondConstant.byteOffset)
    .map((constant) => {
      const register = Math.floor(constant.byteOffset / REGISTER_BYTES);
      const firstComponent = (constant.byteOffset % REGISTER_BYTES) / COMPONENT_BYTES;
      const components = COMPONENTS.slice(firstComponent, firstComponent + constant.columns);
      const span =
        constant.rows > 1 || constant.arrayLength > 1 ? ` (${computeRegisters(constant).length} registers)` : "";
      return `// cb0[${register}].${components}: ${constant.name}${span}`;
    });
  return `${header.join("\n")}\n${assembly}`;
};
