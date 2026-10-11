// The double submit cookie: the cookie a response sets, and the header a state-changing request must repeat it in
export interface CsrfOptions {
  cookieName: string;
  headerName: string;
}
