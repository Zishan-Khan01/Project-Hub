import helmet from "helmet";

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: ["'self'"],

      styleSrc: ["'self'", "'unsafe-inline'"],

      imgSrc: ["'self'", "data:", "blob:"],

      fontSrc: ["'self'", "data:"],

      connectSrc: [
        "'self'",
        "https://13.49.189.233",
        "http://localhost:3000",
        "http://localhost:5173",
      ],

      objectSrc: ["'none'"],

      baseUri: ["'self'"],

      frameAncestors: ["'none'"],

      formAction: ["'self'"],

      upgradeInsecureRequests: [],
    },
  },

  crossOriginEmbedderPolicy: false,
});