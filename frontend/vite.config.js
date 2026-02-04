import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "../backend/public",
    emptyOutDir: false,   // IMPORTANT: don’t delete backend/public (index.php/.htaccess)
}
});
