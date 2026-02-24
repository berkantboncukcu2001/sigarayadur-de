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

    // Government Credentials Check
    const { rows: govRows } = await db.query(
        "SELECT * FROM government_credentials WHERE LOWER(name) = LOWER($1) AND LOWER(surname) = LOWER($2) AND tc_no = $3",
        [name, surname, tc_no]
    );
    const govCheck = govRows[0];
    if (!govCheck) {
        return { success: false, error: "Sistemde böyle bir T.C. Kimlik doğrulaması bulunamadı. Lütfen Adınızı, Soyadınızı ve TC numaranızı tam olarak resmi kayıtlardaki gibi girdiğinizden emin olun." };
    }

    // Duplicate Check logic: Name + Surname + TC No (already handled by unique constraint, but good for UX)
    const { rows: userRows } = await db.query(
        "SELECT * FROM users WHERE LOWER(name) = LOWER($1) AND LOWER(surname) = LOWER($2) AND dob = $3",
        [name, surname, dob]
    );
    const existingUser = userRows[0];

    if (existingUser) {
        return { success: false, error: "Bu isim, soyisim ve doğum tarihine sahip bir kullanıcı zaten mevcut." };
    }

    // Username Duplicate Check
    const { rows: usernameRows } = await db.query(
        "SELECT * FROM users WHERE LOWER(username) = LOWER($1)",
        [username]
    );
    const existingUsername = usernameRows[0];
    if (existingUsername) {
        return { success: false, error: "Bu kullanıcı adı zaten alınmış." };
    }

    try {
        await db.query(`
      INSERT INTO users (name, surname, tc_no, username, password, dob, gender, smoke_start_date, cigarettes_per_day, data_agreement)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
    `, [name, surname, tc_no, username, password, dob, gender, smoke_start_date, Number(cigarettes_per_day)]);

        // Optional: Log them in automatically
        // const cookieStore = await cookies();
        // cookieStore.set("auth_token", info.lastInsertRowid.toString(), { httpOnly: true, path: "/" });

        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, error: "Veritabanı hatası oluştu." };
    }
}
