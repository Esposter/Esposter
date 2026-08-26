// One indentation step per level below the comment the route names. The step count clamps so a long chain does
// Not squeeze its text into a column; the nesting itself stays unbounded, and past the clamp a node offers to
// Continue the thread on its own page instead of moving further right
export const COMMENT_INDENT_STEP = "1.5rem";
export const MAX_COMMENT_INDENT_DEPTH = 6;
