import type { PositionalArgDef, StringArgDef } from "citty";

// The section of a public video a clip takes, as both the generic clip and the parity recording take it
export const clipSectionArgs: {
  from: { required: true } & StringArgDef;
  name: { default: string } & StringArgDef;
  to: { required: true } & StringArgDef;
  url: { required: true } & PositionalArgDef;
} = {
  url: { description: "The public video's URL", required: true, type: "positional" },
  from: { description: "The second the section starts at", required: true, type: "string" },
  name: {
    default: "",
    description: "The clip's name in its file name, from-to when not given",
    required: false,
    type: "string",
  },
  to: { description: "The second the section ends at", required: true, type: "string" },
};
