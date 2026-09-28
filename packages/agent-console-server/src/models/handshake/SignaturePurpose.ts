import { z } from "zod";

// What a signature over a nonce vouches for, and signed with it. One key signs both, so without the purpose a page's
// Challenge could have the host sign another connection's nonce and pass that off as its own executable's signature
export enum SignaturePurpose {
  HostProof = "HostProof",
  OwnerProof = "OwnerProof",
}

export const signaturePurposeSchema: z.ZodEnum<typeof SignaturePurpose> = z.enum(
  SignaturePurpose,
) satisfies z.ZodType<SignaturePurpose>;
