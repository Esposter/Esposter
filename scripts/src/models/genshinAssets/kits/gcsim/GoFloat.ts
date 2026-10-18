// A whole-valued float, which a bare number would read as an int, so a division of it keeps its fraction as Go's does.
// A float with a fraction is a bare number, which is a float by its value alone
export interface GoFloat {
  float: number;
}
