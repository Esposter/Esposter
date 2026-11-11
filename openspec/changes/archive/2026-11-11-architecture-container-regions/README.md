# architecture-container-regions

Every region-owning container in the app draws its own body, header and footer, and a shared async body draws the loading, error and empty states, so call sites supply content only.
