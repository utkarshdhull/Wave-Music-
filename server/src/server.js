import { app, ensureDb } from "./app.js";
import { env } from "./config/env.js";

// For local execution only
if (!process.env.VERCEL) {
  ensureDb()
    .then(() => {
      app.listen(env.port, () => {
        console.log(`Wave API listening on port ${env.port}`);
      });
    })
    .catch((error) => {
      console.error("Database connection failed:", error);
      process.exit(1);
    });
}

// Vercel expects the default export to be the Express app
export default app;
