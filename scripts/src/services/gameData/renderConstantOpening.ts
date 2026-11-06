// The line that opens a constant `renderConstant` writes, its body and `RENDERED_CONSTANT_CLOSING` following it
export const renderConstantOpening = (name: string): string => `export const ${name} = {`;
