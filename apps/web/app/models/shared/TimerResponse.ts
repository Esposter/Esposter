// A worker posts back the id of each timer that fired, and the page looks up the callback it kept under that id
export interface TimerResponse {
  id: number;
}
