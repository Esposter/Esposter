import type { ShaderConstant } from "#src/services/genshinAssets/materials/readShaderConstantLayouts";

// A register of a constant buffer is 16 bytes, four components of four
const REGISTER_BYTES = 16;
const COMPONENT_BYTES = 4;
const COMPONENTS = "xyzw";
// The first constant buffer's size as an assembly declares it, or as decompiled HLSL does where the program carries no
// Names of its own
const BUFFER_SIZE_REGEX = /(?:dcl_constantbuffer CB0|float4 cb0)\[(?<size>\d+)\]/u;
const REGISTER_REGEX = /cb0\[(?<register>\d+)\]/gu;
// The registers a constant spans: its offset, over its rows (a matrix's four, a vector's one) and its array's length
const readRegisters = ({ arrayLength, byteOffset, rows }: ShaderConstant): number[] => {
  const count = Math.max(rows, 1) * Math.max(arrayLength, 1);
  const first = Math.floor(byteOffset / REGISTER_BYTES);
  return Array.from({ length: count }, (_, index) => first + index);
};
// Whether no two of a layout's constants share a byte, as one program's layout never does: an overlap is two lists read
// As one
const checkIsDisjoint = (layout: readonly ShaderConstant[]): boolean => {
  const sorted = layout.toSorted((first, second) => first.byteOffset - second.byteOffset);
  return sorted.every(
    (constant, index) =>
      index === 0 ||
      constant.byteOffset >= (sorted[index - 1]?.byteOffset ?? 0) + (sorted[index - 1]?.columns ?? 0) * COMPONENT_BYTES,
  );
};
// A disassembled or decompiled program headed by what its first constant buffer's registers hold, named from the layout of its
// Shader's that fits it: one whose constants share no byte, that names every register the program reads and ends
// Within the buffer it declares, preferring the one that names the most. Without one that fits, the program is left
// As it is
export const annotateProgramConstants = (assembly: string, layouts: readonly ShaderConstant[][]): string => {
  const size = Number(BUFFER_SIZE_REGEX.exec(assembly)?.groups?.size ?? 0);
  if (size === 0) return assembly;
  // The registers it reads, its buffer's own declaration aside, which HLSL writes in the same form as a read
  const body = assembly.replace(BUFFER_SIZE_REGEX, "");
  const usedRegisters = new Set(Array.from(body.matchAll(REGISTER_REGEX), (match) => Number(match.groups?.register)));
  let best: ShaderConstant[] | undefined;
  let bestCount = 0;
  for (const layout of layouts) {
    const named = new Set(layout.flatMap((constant) => readRegisters(constant)));
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
    .toSorted((first, second) => first.byteOffset - second.byteOffset)
    .map((constant) => {
      const register = Math.floor(constant.byteOffset / REGISTER_BYTES);
      const firstComponent = (constant.byteOffset % REGISTER_BYTES) / COMPONENT_BYTES;
      const components = COMPONENTS.slice(firstComponent, firstComponent + constant.columns);
      const span =
        constant.rows > 1 || constant.arrayLength > 1 ? ` (${readRegisters(constant).length} registers)` : "";
      return `// cb0[${register}].${components}: ${constant.name}${span}`;
    });
  return `${header.join("\n")}\n${assembly}`;
};
