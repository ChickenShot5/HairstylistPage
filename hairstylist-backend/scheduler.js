const cron = require("node-cron");
const db = require("./db/database");

// Run every day at midnight
cron.schedule("0 0 * * *", () => {
  const deleted = db
    .prepare(
      "DELETE FROM notifications WHERE created_at < datetime('now', '-7 days')"
    )
    .run();
  console.log(`[CRON] Cleaned up old notifications at midnight`);
});
