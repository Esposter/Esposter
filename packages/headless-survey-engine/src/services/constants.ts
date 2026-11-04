// The most characters a question's name may hold, so a name stays short enough to read inside an expression
export const MAX_SURVEY_QUESTION_NAME_LENGTH = 256;
// The most questions a survey may hold, counted across every page and panel
export const MAX_SURVEY_QUESTION_COUNT = 1000;
// The most nodes a survey may hold, its pages and panels with its questions, so a document cannot grow past what a save walks
export const MAX_SURVEY_NODE_COUNT = 1500;
// The most choices a question's list may hold, so a list cannot outgrow what a respondent reads
export const MAX_SURVEY_CHOICE_COUNT = 200;
// The most inputs one multiple text question holds, so the question stays a form a respondent fills in one pass
export const MAX_SURVEY_MULTIPLE_TEXT_ITEM_COUNT = 50;
// The most columns a dynamic matrix may hold, so each row a respondent adds stays readable across the screen
export const MAX_SURVEY_MATRIX_COLUMN_COUNT = 50;
// The most rows a dynamic matrix may hold, the bound every row count is held to
export const MAX_SURVEY_MATRIX_ROW_COUNT = 100;
// The most characters a text field may hold: a title, a description, a label, a choice's text or an error message
export const MAX_SURVEY_TEXT_LENGTH = 1000;
// The largest a picture's width or height may be drawn, in pixels, so a picture cannot outgrow the screen it is read on
export const MAX_SURVEY_IMAGE_SIZE = 2048;
// The most characters a block of HTML or a completion page's markup may hold
export const MAX_SURVEY_HTML_LENGTH = 20_000;
// The most characters a node's id may hold
export const MAX_SURVEY_ID_LENGTH = 64;
// The most validators a question may hold
export const MAX_SURVEY_VALIDATOR_COUNT = 20;
// The most calculated values a survey may hold
export const MAX_SURVEY_CALCULATED_VALUE_COUNT = 100;
// The most characters a text question's pattern may hold, a regular expression the runner compiles for each answer
export const MAX_SURVEY_PATTERN_LENGTH = 200;
// The most characters a URL may hold, the bound the app keeps on its own URLs, mirrored here since this package cannot import it
export const MAX_SURVEY_URL_LENGTH = 2048;
// The most characters an answer's text may hold, the bound every string an answer holds is held to whatever its question allows
export const MAX_SURVEY_ANSWER_LENGTH = 10_000;
// The most entries a list or a record inside an answer may hold, the most any question's rows, columns or choices reach
export const MAX_SURVEY_ANSWER_ENTRY_COUNT = 200;
