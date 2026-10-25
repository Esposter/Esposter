// The fields the server derives as counts, read by the `no-restricted-syntax` selectors in `restrictedSyntaxes.js` and
// It is read by the `count-write-after-settle` oxlint rule too, so the two never disagree about which field is a count.
export const SERVER_COUNT_FIELDS = ["commentCount", "likeCount", "memberCount"];
// A role's count sits one level down, as `countsByTopRole[i].count`, and is named by the list it is an item of.
export const SERVER_COUNT_ROLE_LIST = "countsByTopRole";
// The field a role's count is read from within an item of that list.
export const SERVER_COUNT_ROLE_FIELD = "count";
