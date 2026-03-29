import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  const landingPath = path.resolve(__dirname, "..", "landing");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve landing page static assets at root level
  if (fs.existsSync(landingPath)) {
    app.use("/base.css", express.static(path.join(landingPath, "base.css")));
    app.use("/style.css", express.static(path.join(landingPath, "style.css")));
    app.use("/app.js", (_req, res) => {
      res.sendFile(path.join(landingPath, "app.js"));
    });
  }

  // Serve the React app under /app
  app.use("/app", express.static(distPath));
  app.get("/app/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // Serve landing page at root
  if (fs.existsSync(landingPath)) {
    app.get("/", (_req, res) => {
      res.sendFile(path.join(landingPath, "index.html"));
    });
  }

  // Fallback: any non-API, non-app route goes to landing page
  app.use("/{*path}", (_req, res) => {
    if (fs.existsSync(landingPath)) {
      res.sendFile(path.join(landingPath, "index.html"));
    } else {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
