// A register of a constant buffer is 16 bytes, four components of four
export const REGISTER_BYTES = 16;
export const COMPONENT_BYTES = 4;

export const VECTOR_OR_MATRIX_PARAMETER_BYTES = 12;
export const PARAMETER_FLAG_BYTES = 2;
// The disassembler a machine without Windows' compiler library runs, by the name it is found on PATH under
export const VKD3D_COMPILER_NAME = "vkd3d-compiler";
// The compiler a run calls, named by VKD3D_COMPILER or else found on PATH. Read at each call, so a value set after import is seen
export const resolveVkd3dCompiler = (): string => process.env.VKD3D_COMPILER ?? VKD3D_COMPILER_NAME;
// A DXBC container's magic, the four bytes its compiled program opens with
export const DXBC_MAGIC = "DXBC";
// The driving name Unity writes on a render state value no material property drives, so the shader sets it as a literal
export const UNNAMED_PROPERTY = "<noninit>";
