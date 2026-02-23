"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleAiModeAction(isAiOn: boolean) {
    const modeStr = isAiOn ? "true" : "false";
    db.prepare(`
    INSERT INTO settings (key, value) VALUES ('ai_toggle', ?)
    ON CONFLICT(key) DO UPDATE SET value = ?
  `).run(modeStr, modeStr);

    revalidatePath("/administratoroftheapp");
    return { success: true };
}

export async function saveDailyMessageAction(targetDate: string, ageGroup: string, message: string) {
    if (!targetDate || !ageGroup || !message) return { success: false };

    db.prepare(`
    INSERT INTO daily_messages (target_date, age_group, message)
    VALUES (?, ?, ?)
    ON CONFLICT(target_date, age_group) DO UPDATE SET message = ?
  `).run(targetDate, ageGroup, message, message);

    revalidatePath("/administratoroftheapp");
    return { success: true };
}
