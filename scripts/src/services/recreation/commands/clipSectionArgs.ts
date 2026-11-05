import type { PositionalArgDef, StringArgDef } from "citty";

// The section of a public video a clip takes, as both the generic clip and the parity recording take it
export const clipSectionArgs: {
  from: StringArgDef & { required: true };
  name: StringArgDef & { default: string };
  to: StringArgDef & { required: true };
  url: PositionalArgDef & { required: true };
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
