import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [react(), compression()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 5173,
  }
})
