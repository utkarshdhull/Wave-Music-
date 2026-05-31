import http from "node:http";
import { app } from "../server/src/app.js";

const server = http.createServer(app);

function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        method: "GET",
        path,
        port: server.address().port
      },
      (res) => {
        let body = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => resolve({ body, statusCode: res.statusCode }));
      }
    );

    req.on("error", reject);
    req.end();
  });
}

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

try {
  const health = await request("/api/health");
  const missing = await request("/api/missing");

  if (health.statusCode !== 200 || JSON.parse(health.body).status !== "ok") {
    throw new Error("Health route failed");
  }

  if (missing.statusCode !== 404) {
    throw new Error("Not-found route failed");
  }

  console.log("server smoke ok");
} finally {
  await new Promise((resolve) => server.close(resolve));
}

