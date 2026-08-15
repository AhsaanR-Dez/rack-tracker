import { buildApp } from "./app.js";
import { config } from "./config.js";
import { logger } from "./logger.js";

const app = buildApp();

app.listen(config.port, () => {
  logger.info({ port: config.port, nodeEnv: config.nodeEnv }, "server listening");
});
