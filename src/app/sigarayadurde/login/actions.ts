"use server";

import db from "@/lib/db";
import { cookies } from "next/headers";

export async function loginUser(formData: FormData) {
    const username = formData.get("username")?.toString().trim();
    const password = formData.get("password")?.toString();
    const remember = formData.get("remember");

    if (!username || !password) {
        return { success: false, error: "Kullanıcı adı ve şifre zorunludur." };
    }

    const user = db.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE AND password = ?").get(username, password) as any;

    if (!user) {
        return { success: false, error: "Kullanıcı adı veya şifre hatalı." };
    }

    // GMT+3 Check
    const gmt3Date = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
    const todayStr = `${gmt3Date.getFullYear()}-${String(gmt3Date.getMonth() + 1).padStart(2, '0')}-${String(gmt3Date.getDate()).padStart(2, '0')}`;

    if (user.last_login_date !== todayStr) {
        db.prepare("UPDATE users SET last_login_date = ?, daily_login_count = 1 WHERE id = ?").run(todayStr, user.id);
    } else {
        db.prepare("UPDATE users SET daily_login_count = daily_login_count + 1 WHERE id = ?").run(user.id);
    }

    try {
        const cookieStore = await cookies();
        // Use true maxAge if remember is checked (e.g., 30 days), else session cookie
        const options: any = { httpOnly: true, path: "/" };
        if (remember) {
            options.maxAge = 60 * 60 * 24 * 30; // 30 days
        }
        cookieStore.set("user_token", user.id.toString(), options);

        return { success: true };
    } catch (err) {
        return { success: false, error: "Oturum açılırken bir hata oluştu." };
    }
}
