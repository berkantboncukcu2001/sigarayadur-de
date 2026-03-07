"use server";

import db from "@/lib/db";
import { cookies } from "next/headers";

export async function changePassword(currentPass: string, newPass: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_token")?.value;

    if (!userId) {
        return { success: false, error: "Yetkisiz erişim. Lütfen tekrar giriş yapın." };
    }

    try {
        const { rows } = await db.query("SELECT password FROM users WHERE id = $1", [userId]);
        if (rows.length === 0) {
            return { success: false, error: "Kullanıcı bulunamadı." };
        }

        const user = rows[0];

        if (user.password !== currentPass) {
            return { success: false, error: "Mevcut şifreniz hatalı." };
        }

        if (newPass.length < 6) {
            return { success: false, error: "Yeni şifre en az 6 karakter olmalıdır." };
        }

        await db.query("UPDATE users SET password = $1 WHERE id = $2", [newPass, userId]);
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { success: false, error: "Şifre değiştirilirken veritabanı hatası oluştu." };
    }
}
