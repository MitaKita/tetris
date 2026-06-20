import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    // 1. Specifies the testing environment (simulates a browser)
    environment: "jsdom",

    // 2. Allows using 'describe', 'it', 'expect' without importing them in every file
    globals: true,

    // 3. Points to your setup file for custom matchers and mocks
    setupFiles: "./vitest.setup.ts",

    // 4. Optimization: exclude node_modules and Next.js build folders
    exclude: ["node_modules", ".next", "out"],
  },
  resolve: {
    alias: {
      // 5. Matches your tsconfig.json paths (usually @/ points to /src or root)
      "@": path.resolve(__dirname, "./"),
    },
  },
})
