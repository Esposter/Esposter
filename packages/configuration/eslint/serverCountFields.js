// The fields the server derives as counts. The `no-restricted-syntax` selectors in `restrictedSyntaxes.js` read them.
// The `count-write-after-settle` oxlint rule reads them too, so the two never disagree about which field is a count.
export const SERVER_COUNT_FIELDS = ["commentCount", "likeCount", "memberCount"];
// A role's count sits one level down, as `countsByTopRole[i].count`, and is named by the list it is an item of.
export const SERVER_COUNT_ROLE_LIST = "countsByTopRole";
// The field a role's count is read from within an item of that list.
export const SERVER_COUNT_ROLE_FIELD = "count";
