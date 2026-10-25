// The fields the server derives as counts, read by the `no-restricted-syntax` selectors in `restrictedSyntaxes.js` and
// by the `count-write-after-settle` oxlint rule, so the two never disagree about which field is a count.
export const SERVER_COUNT_FIELDS = ["commentCount", "likeCount", "memberCount"];
// A role's count sits one level down, as `countsByTopRole[i].count`, and is named by the list it is an item of.
export const SERVER_COUNT_ROLE_LIST = "countsByTopRole";
