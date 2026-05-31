import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

let dbConnection = null;

async function initDb() {
  if (!dbConnection) {
    dbConnection = connectDb(env.mongodbUri);
  }
  await dbConnection;
}

// For local execution
if (!process.env.VERCEL) {
  initDb()
    .then(() => {
      app.listen(env.port, () => {
        console.log(`Wave API listening on port ${env.port}`);
      });
    })
    .catch((error) => {
      console.error("Local database connection failed:", error);
      process.exit(1);
    });
}

// Middleware to guarantee MongoDB connectivity on Vercel Serverless Function invocations
app.use(async (req, res, next) => {
  try {
    await initDb();
    next();
  } catch (error) {
    next(error);
  }
});

export default app;

