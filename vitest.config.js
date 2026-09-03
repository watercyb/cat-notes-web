import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["backend/tests/unit/**/*.test.js"],
          fileParallelism: true,
        },
      },
      {
        test: {
          name: "integration",
          include: ["backend/tests/integration/**/*.integration.test.js"],
          fileParallelism: false,
        },
      },
    ],
  },
});
