import pkg from "@nmhillusion/n2ngin-bull-engine";
import type { RenderConfig } from "@nmhillusion/n2ngin-bull-engine";
const { BullEngine } = pkg;
import * as path from "path";
import * as fs from "fs";

const isWatch = process.argv.includes("--watch");

const build = async () => {
  const engine = new BullEngine();

  const renderConfig: RenderConfig = {
    rootDir: path.resolve(import.meta.dirname, "src"),
    outDir: path.resolve(import.meta.dirname, "dist"),
    watch: {
      enabled: isWatch,
    },
    pug: {
      enabled: true,
      config: {
        pretty: true,
      },
    },
    markdown: {
      enabled: false,
    },
    scss: {
      enabled: true,
    },
    typescript: {
      enabled: true,
    },
    copyResource: {
      enabled: true,
      config: {
        extsToCopy: [
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".ico",
          ".woff",
          ".ttf",
          ".json",
          ".svg",
        ],
      },
    },
    rewriteJavascript: {
      enabled: true,
      config: {
        compress: false,
      },
    },
  };

  console.log("Starting build with BullEngine...");

  const publicDir = path.resolve(import.meta.dirname, "public");
  const distDir = path.resolve(import.meta.dirname, "dist");

  // Clean dist folder
  if (fs.existsSync(distDir)) {
    console.log("Cleaning dist folder...");
    fs.rmSync(distDir, { recursive: true });
  }

  if (fs.existsSync(publicDir)) {
    console.log("Copying public folder to dist...");
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    fs.cpSync(publicDir, distDir, { recursive: true });
  }

  try {
    await engine.config(renderConfig).render();
    console.log("Build completed successfully!");
  } catch (err) {
    console.error("Build failed:", err);
    process.exit(1);
  }
};

build();
