import { defineConfig } from "vite";
import { resolve, basename, extname } from "path";
import { readdirSync } from "fs";

// Helper to find all HTML files in src directory
const getHtmlEntries = () => {
  const srcDir = resolve(__dirname, "src");
  const entries: Record<string, string> = {};

  const scan = (dir: string) => {
    try {
      const files = readdirSync(dir, { withFileTypes: true });
      files.forEach((file) => {
        const fullPath = resolve(dir, file.name);
        if (file.isDirectory()) {
          scan(fullPath);
        } else if (extname(file.name) === ".html") {
          const name = basename(file.name, ".html");
          entries[name] = fullPath;
        }
      });
    } catch (err) {
      console.error(`Could not read directory ${dir}`, err);
    }
  };

  scan(srcDir);
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
