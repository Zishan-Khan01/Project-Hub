import app from "./src/app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(
    `API listening on port ${env.PORT} (${env.NODE_ENV})`
  );
});