import { InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";

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
// Every DXBC program in a folder disassembled beside it, returning how many were
export const disassembleDxbcDirectory = (directory: string): number => {
  if (process.platform !== "win32")
    throw new InvalidOperationError(Operation.Read, directory, "disassembling DXBC needs Windows' d3dcompiler_47");
  const output = execFileSync("powershell", ["-NoProfile", "-Command", createScript(directory)], {
    encoding: "utf8",
    maxBuffer: 1024 ** 2,
  });
  return Number(output.trim());
};
