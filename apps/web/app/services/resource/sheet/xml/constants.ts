// The element a cell takes when its column name is not a valid XML name, which the name then rides on as an attribute
export const XML_CELL_ELEMENT_NAME = "cell";
// The ASCII subset of the XML Name production, so a name that matches is always a valid element name
export const XML_NAME_REGEX = /^[A-Z_a-z][\w.-]*$/u;
export const XML_ROOT_ELEMENT_NAME = "rows";
export const XML_ROW_ELEMENT_NAME = "row";
