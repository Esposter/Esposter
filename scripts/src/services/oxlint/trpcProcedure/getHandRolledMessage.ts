// A rejected mutation reads the same whether a guard caught it or the router asserted it, which is why the code
// And the message are paired in one constructor rather than at every throw site.
export const getHandRolledMessage = (errorName: string, guardName: string): string =>
  `Hand-rolled TRPCError: \`${guardName}\` already pairs this code with \`${errorName}\`'s message. Throw \`${guardName}(...)\` instead — it takes the code as its last argument when it is not the default.`;
