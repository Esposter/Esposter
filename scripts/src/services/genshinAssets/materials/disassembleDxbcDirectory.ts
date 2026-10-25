import { disassembleWithD3d } from "#src/services/genshinAssets/materials/disassembleWithD3d";
import { disassembleWithVkd3d } from "#src/services/genshinAssets/materials/disassembleWithVkd3d";

// Every DXBC program in a folder disassembled beside it, returning how many were. Windows reads them through
// D3DDisassemble; elsewhere `vkd3d-compiler` disassembles each one, and a program it cannot read is left without its assembly
export const disassembleDxbcDirectory = (directory: string): number =>
  process.platform === "win32" ? disassembleWithD3d(directory) : disassembleWithVkd3d(directory);
