// Which way a portable format moves a resource: out of the app into a file, or into the app from one
export const PortableFormatKind = { Export: "export", Import: "import" } as const;
export type PortableFormatKind = (typeof PortableFormatKind)[keyof typeof PortableFormatKind];
