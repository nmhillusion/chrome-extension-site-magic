const { BullEngine } = require("@nmhillusion/n2ngin-bull-engine");
const path = require("path");
const fs = require("fs");

const isWatch = process.argv.includes("--watch");

const build = async () => {
  const engine = new BullEngine();

  const renderConfig = {
    rootDir: path.resolve(__dirname, "src"),
    outDir: path.resolve(__dirname, "dist"),
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

  // Copy public folder to dist
  const publicDir = path.resolve(__dirname, "public");
  const distDir = path.resolve(__dirname, "dist");

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
