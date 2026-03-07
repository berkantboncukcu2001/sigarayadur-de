import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_token")?.value;

    if (!userId) {
        redirect("/login");
    }

    const { rows: userRows } = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = userRows[0];

    if (!user) {
        redirect("/login");
    }

    return (
        <main style={{ padding: "1rem" }}>
            <div className="glass-panel" style={{ maxWidth: "600px", margin: "10vh auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Ayarlar</h1>
                    <a href="/sigarayadurde" className="btn-primary" style={{ width: "auto", background: "var(--input-bg)", textDecoration: "none", color: "var(--primary)", padding: "0.2rem 0.8rem", border: "1px solid var(--input-border)", fontSize: "1.5rem", lineHeight: 1 }} title="Kapat">
                        &times;
                    </a>
                </div>

                <div style={{ marginTop: "2rem", padding: "1.5rem", background: "var(--input-bg)", borderRadius: "12px", border: "1px solid var(--input-border)" }}>
                    <h3 style={{ marginBottom: "1rem" }}>Profil Bilgileri</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <p><strong>Ad:</strong> <br />{user.name}</p>
                        <p><strong>Soyad:</strong> <br />{user.surname}</p>
                        <p><strong>Öğrenci Numarası:</strong> <br />{user.tc_no}</p>
                        <p><strong>Doğum Tarihi:</strong> <br />{user.dob}</p>
                        <p><strong>Cinsiyet:</strong> <br />{user.gender}</p>
                        <p><strong>Sigaraya Başlama:</strong> <br />{user.smoke_start_date}</p>
                    </div>
                </div>

                <div style={{ marginTop: "2rem" }}>
                    <h3 style={{ marginBottom: "1rem" }}>Şifre Değiştir</h3>
                    <SettingsForm />
                </div>
            </div>
        </main>
    );
}
