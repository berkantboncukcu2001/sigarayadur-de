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

export async function saveAllDailyMessagesAction(targetDate: string, messages: { ageGroup: string, message: string }[]) {
  if (!targetDate || !messages.length) return { success: false };

  try {
    const values: string[] = [];
    const queryParams: any[] = [];
    let paramCounter = 1;

    messages.forEach((m) => {
      if (!m.message) return; // skip empty
      queryParams.push(targetDate, m.ageGroup, m.message);
      values.push(`($${paramCounter}, $${paramCounter + 1}, $${paramCounter + 2})`);
      paramCounter += 3;
    });

    if (values.length === 0) return { success: true }; // nothing to save

    const query = `
        INSERT INTO daily_messages (target_date, age_group, message)
        VALUES ${values.join(", ")}
        ON CONFLICT(target_date, age_group) DO UPDATE SET message = EXCLUDED.message
      `;

    await db.query(query, queryParams);
    revalidatePath("/administratoroftheapp");

    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
