import { execFileSync, spawnSync } from "@esposter/shared-node/child-process";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Windows' own shader compiler library disassembles a DXBC program into its assembly text, so nothing is installed:
// PowerShell binds `D3DDisassemble` and writes each `<name>.dxbc` in the folder beside it as `<name>.asm`, printing
// How many it wrote
const createScript = (directory: string): string => `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class Dxbc {
  [DllImport("d3dcompiler_47.dll")]
  static extern int D3DDisassemble(byte[] data, UIntPtr size, uint flags, string comments, out IntPtr blob);
  [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate IntPtr GetPointer(IntPtr self);
  [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate UIntPtr GetSize(IntPtr self);
  [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate uint Release(IntPtr self);
  public static string Disassemble(byte[] data) {
    IntPtr blob;
    if (D3DDisassemble(data, (UIntPtr)data.Length, 0, null, out blob) != 0) return null;
    IntPtr table = Marshal.ReadIntPtr(blob);
    var release = Marshal.GetDelegateForFunctionPointer<Release>(Marshal.ReadIntPtr(table, 2 * IntPtr.Size));
    var getPointer = Marshal.GetDelegateForFunctionPointer<GetPointer>(Marshal.ReadIntPtr(table, 3 * IntPtr.Size));
    var getSize = Marshal.GetDelegateForFunctionPointer<GetSize>(Marshal.ReadIntPtr(table, 4 * IntPtr.Size));
    string text = Marshal.PtrToStringAnsi(getPointer(blob), (int)getSize(blob).ToUInt64()).TrimEnd((char)0);
    release(blob);
    return text;
  }
}
"@
$count = 0
foreach ($file in Get-ChildItem -LiteralPath '${directory.replaceAll("'", "''")}' -Filter *.dxbc) {
  $text = [Dxbc]::Disassemble([System.IO.File]::ReadAllBytes($file.FullName))
  if ($text) {
    [System.IO.File]::WriteAllText([System.IO.Path]::ChangeExtension($file.FullName, ".asm"), $text)
    $count++
  }
}
$count
`;
// Where a machine without Windows' compiler library gets its disassembler: `vkd3d-compiler` from Wine's vkd3d project,
// Named by VKD3D_COMPILER or found on PATH
const VKD3D_ARGUMENTS = ["-x", "dxbc-tpf", "-b", "d3d-asm"];
// A program's disassembly past this is a failure the run should stop on, not a program to skip
const VKD3D_MAX_BUFFER = 64 * 1024 ** 2;
// Every DXBC program in a folder disassembled beside it, returning how many were. Windows reads them through
// D3DDisassemble; elsewhere `vkd3d-compiler` disassembles each one, and a program it cannot read is left without its assembly
export const disassembleDxbcDirectory = (directory: string): number =>
  process.platform === "win32" ? disassembleWithD3d(directory) : disassembleWithVkd3d(directory);
const disassembleWithD3d = (directory: string): number => {
  const output = execFileSync("powershell", ["-NoProfile", "-Command", createScript(directory)], {
    encoding: "utf8",
    maxBuffer: 1024 ** 2,
  });
  return Number(output.trim());
};
const disassembleWithVkd3d = (directory: string): number => {
  let count = 0;
  for (const name of readdirSync(directory)) {
    if (!name.endsWith(".dxbc")) continue;
    const { error, status, stdout } = spawnSync(
      process.env.VKD3D_COMPILER ?? "vkd3d-compiler",
      [...VKD3D_ARGUMENTS, join(directory, name)],
      { encoding: "utf8", maxBuffer: VKD3D_MAX_BUFFER },
    );
    // A missing compiler throws, since no program can then be read; a program it cannot read is skipped
    if (error) throw error;
    if (status !== 0) continue;
    writeFileSync(join(directory, name.replace(/\.dxbc$/u, ".asm")), stdout);
    count++;
  }
  return count;
};
