"use server";

import db from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function registerUser(formData: FormData) {
    const name = formData.get("name")?.toString().trim();
    const surname = formData.get("surname")?.toString().trim();
    const username = formData.get("username")?.toString().trim();
    const tc_no = formData.get("tc_no")?.toString().trim();
    const password = formData.get("password")?.toString();
    const dob = formData.get("dob")?.toString();
    const gender = formData.get("gender")?.toString();
    const smoke_start_date = formData.get("smoke_start_date")?.toString();
    const cigarettes_per_day = formData.get("cigarettes_per_day")?.toString();

    if (!name || !surname || !username || !tc_no || !password || !dob || !gender || !smoke_start_date || !cigarettes_per_day) {
        return { success: false, error: "Lütfen tüm alanları doldurun." };
    }

    if (tc_no.length !== 11 || !/^\d+$/.test(tc_no)) {
        return { success: false, error: "TC Kimlik Numaranız 11 haneli rakamlardan oluşmalıdır." };
    }

    // Duplicate Check logic: Name + Surname + DOB
    const existingUser = db.prepare("SELECT * FROM users WHERE name = ? COLLATE NOCASE AND surname = ? COLLATE NOCASE AND dob = ?").get(name, surname, dob);

    if (existingUser) {
        return { success: false, error: "Bu isim, soyisim ve doğum tarihine sahip bir kullanıcı zaten mevcut." };
    }

    // Username Duplicate Check
    const existingUsername = db.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE").get(username);
    if (existingUsername) {
        return { success: false, error: "Bu kullanıcı adı zaten alınmış." };
    }

    try {
        const info = db.prepare(`
      INSERT INTO users (name, surname, tc_no, username, password, dob, gender, smoke_start_date, cigarettes_per_day, data_agreement)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(name, surname, tc_no, username, password, dob, gender, smoke_start_date, Number(cigarettes_per_day));

        // Optional: Log them in automatically
        // const cookieStore = await cookies();
        // cookieStore.set("auth_token", info.lastInsertRowid.toString(), { httpOnly: true, path: "/" });

        return { success: true };
    } catch (err) {
        return { success: false, error: "Veritabanı hatası oluştu." };
    }
}
