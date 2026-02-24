"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleAiModeAction(isAiOn: boolean) {
  const modeStr = isAiOn ? "true" : "false";
  await db.query(`
    INSERT INTO settings (key, value) VALUES ('ai_toggle', $1)
    ON CONFLICT(key) DO UPDATE SET value = $2
  `, [modeStr, modeStr]);

  revalidatePath("/administratoroftheapp");
  return { success: true };
}

export async function saveDailyMessageAction(targetDate: string, ageGroup: string, message: string) {
  if (!targetDate || !ageGroup || !message) return { success: false };

  await db.query(`
    INSERT INTO daily_messages (target_date, age_group, message)
    VALUES ($1, $2, $3)
    ON CONFLICT(target_date, age_group) DO UPDATE SET message = $4
  `, [targetDate, ageGroup, message, message]);

  revalidatePath("/administratoroftheapp");
  return { success: true };
}
