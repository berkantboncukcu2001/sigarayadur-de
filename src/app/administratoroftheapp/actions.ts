"use server";

import { cookies } from "next/headers";

const ADMIN_USER = "playe4forlife";
const ADMIN_PASS = "2006002115Guc258020Bb";

export async function adminLogin(formData: FormData) {
    const username = formData.get("username");
    const password = formData.get("password");

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const cookieStore = await cookies();
        cookieStore.set("admin_token", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });
        return { success: true };
    }

    return { success: false, error: "Geçersiz kullanıcı adı veya şifre" };
}

export async function adminLogout() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
}
