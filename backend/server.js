import app from "./app.js";
import { setMaintenanceMode } from "./app.js";
import { connectDB } from "./db/mongodb.js";
import cron from "node-cron";
import { cleanup } from "./utils/cleanup.js";
import { exportdb } from "./controllers/analytics_controller.js";

const port = process.env.PORT;

cron.schedule("0 3 * * *", async () => {
  // 3 AM every day
  console.log("Maintenance starting...");
  setMaintenanceMode(true);

  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    await cleanup();
  } catch (err) {
    console.error("Cleanup error:", err);
  } finally {
    await exportdb();
    setMaintenanceMode(false);
    console.log("Maintenance ended.");
  }
});

app.listen(port, () => {
  console.log("Running on port: ", port);
  connectDB();
});
