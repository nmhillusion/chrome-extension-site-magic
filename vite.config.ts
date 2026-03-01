import { defineConfig } from "vite";
import { resolve, basename, extname } from "path";
import { readdirSync } from "fs";

// Helper to find all HTML files in src directory
const getHtmlEntries = () => {
  const pagesDir = resolve(__dirname, "src");
  const entries: Record<string, string> = {};

  try {
    const files = readdirSync(pagesDir);
    files.forEach((file) => {
      if (extname(file) === ".html") {
        const name = basename(file, ".html");
        entries[name] = resolve(pagesDir, file);
      }
    });
  } catch (err) {
    console.error("Could not read src directory", err);
  }

  return entries;
};

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        ...getHtmlEntries(),
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "[name].[ext]";
          }
          return "assets/[name]-[hash].[ext]";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
