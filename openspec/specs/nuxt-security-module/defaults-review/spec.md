## Purpose

Each header nuxt-security sets by default, its recommended value from OWASP, the W3C and WHATWG specifications and MDN, a keep, change or remove verdict, and whether our overrides still make sense. The defaults are the reviewed set a new app inherits, so every default is checked against published guidance before it is kept or changed.

## Requirements

### Requirement: Each default security header is checked against published guidance before it is kept or changed

Every security header the module sets by default SHALL be checked against published guidance and kept, changed or removed on that basis.

#### Scenario: A header whose source cannot be read stays undecided

- **GIVEN** a default header whose published guidance cannot be read
- **WHEN** the header is reviewed
- **THEN** its verdict is recorded as undecided rather than filled in from memory

### Requirement: Content fetches without their own rule are limited to the app's origin

The default content security policy SHALL restrict every kind of resource that has no directive of its own to the app's own origin.

#### Scenario: A resource type with no directive loads only from the app's origin

- **GIVEN** a page that loads a resource type the content security policy has no directive for
- **WHEN** the resource is requested from another origin
- **THEN** the browser blocks the request

### Requirement: Browsers are told to use HTTPS for two years without preloading

The app SHALL tell browsers to use HTTPS for its host and subdomains for two years and SHALL NOT ask to be added to the browser preload list.

#### Scenario: A secure response sets the two-year HTTPS policy

- **GIVEN** a page served over HTTPS
- **WHEN** a browser receives the response
- **THEN** the browser is told to use HTTPS for the host and its subdomains for two years

#### Scenario: A response over plain HTTP sets no effective policy

- **GIVEN** a page served over plain HTTP
- **WHEN** a browser receives the response
- **THEN** the browser ignores the HTTPS policy header

### Requirement: App pages can be framed only by the same origin

App pages SHALL be frameable only by pages from the same origin, so that the agent console's side pane can show app pages.

#### Scenario: A page from another site cannot frame an app page

- **GIVEN** a page on another site that embeds an app page in a frame
- **WHEN** the frame loads
- **THEN** the browser refuses to display the app page

#### Scenario: The agent console's side pane displays an app page

- **GIVEN** an app page open in the agent console's side pane
- **WHEN** the pane loads it
- **THEN** the app page is displayed

### Requirement: Browser features the app does not use are denied

The app SHALL deny every browser feature that is not in use, and SHALL grant camera, display capture, fullscreen and microphone to its own origin only.

#### Scenario: An embedded third-party frame cannot use geolocation

- **GIVEN** a third-party frame embedded in an app page
- **WHEN** the frame asks for the device's location
- **THEN** the browser denies the request

#### Scenario: The app's own pages can use the granted features

- **GIVEN** an app page that needs the microphone for a call
- **WHEN** the page asks for the microphone
- **THEN** the browser grants the request for the app's own origin

### Requirement: Cross-origin embedding stays at credentialless until each resource is confirmed

The app SHALL keep its cross-origin embedder policy at credentialless and SHALL NOT switch to the stricter require-corp value until every cross-origin resource is confirmed to meet its request mode.

#### Scenario: A cross-origin resource loads without credentials

- **GIVEN** a page that loads a cross-origin resource without credentials
- **WHEN** the resource is requested
- **THEN** the resource loads without the page's credentials

### Requirement: Responses carry the anti-sniffing, referrer and isolation headers

Every page response SHALL carry the sniffing, referrer, DNS prefetch, cross-domain policy, isolation and agent cluster headers the defaults set.

#### Scenario: A page response carries the default protective headers

- **GIVEN** any page the app serves
- **WHEN** the response is sent
- **THEN** it sets content-type sniffing off, sends no referrer, disables DNS prefetching, and sets the cross-domain policy to none
- **AND** it sets the opener policy and resource policy to same-origin
- **AND** it requests an origin-keyed agent cluster

### Requirement: The legacy XSS filter header is not sent

The app SHALL NOT send the legacy XSS filter header.

#### Scenario: A page response has no legacy XSS filter header

- **GIVEN** any page the app serves
- **WHEN** the response is sent
- **THEN** the response carries no legacy XSS filter header

### Requirement: Content policy overrides list every source their directive needs

Any override of a content security policy directive SHALL list every source that directive needs, since an override replaces the default for that directive rather than adding to it.

#### Scenario: An override keeps the sources the directive needs

- **GIVEN** a configuration that overrides a content security policy directive
- **WHEN** the override is reviewed
- **THEN** it lists every source the directive needs, including the app's own origin and its nonce

### Requirement: Images load from any secure origin on every route

Images SHALL load from any HTTPS origin on every route, accepting the privacy cost that comes with it.

#### Scenario: A member embeds an image from any secure site

- **GIVEN** a member who embeds an image hosted on any HTTPS site
- **WHEN** a page with that image is viewed on any route
- **THEN** the image loads

### Requirement: Web workers load only from the app's origin or from blob addresses

Web workers SHALL load only from the app's own origin or from blob addresses, which serve the PDF viewer and the graphing feature.

#### Scenario: The PDF viewer starts its worker

- **GIVEN** a member opens a PDF in the app
- **WHEN** the viewer starts
- **THEN** its worker loads from the app's origin or a blob address

### Requirement: Request bodies above the app's size limits are refused

The app SHALL refuse any request whose body is larger than its configured size limit, with those limits taken from shared constants.

#### Scenario: An oversized request body is refused

- **GIVEN** a request whose body is larger than the limit for its kind
- **WHEN** the request is received
- **THEN** the request is refused
