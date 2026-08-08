// The OAuth link round trip reports failure by redirecting back to the settings page with `?error=<code>`
// Rather than by rejecting the `linkSocial` promise, so the codes that path can emit are translated here
export const AccountLinkErrorMessageMap: Record<string, string> = {
  account_already_linked_to_different_user:
    "That provider account already belongs to another Esposter user, so it cannot be linked here. Sign in with it directly instead.",
  "email_doesn't_match": "That provider account uses a different email address to the one on your profile.",
  // The catch-all better-auth falls back to, so the copy names the likeliest cause without asserting it —
  // An unverified provider email is the common one, but a failed write reports the same code
  unable_to_link_account:
    "That provider account could not be linked. It usually means the provider did not confirm its email address — try again, or sign in with it directly.",
};
