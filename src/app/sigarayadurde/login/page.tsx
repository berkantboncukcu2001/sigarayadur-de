import UserLoginForm from "./UserLoginForm";
import { cookies } from "next/headers";
import db from "@/lib/db";
import DailyPopup from "./DailyPopup";

function calculateAge(dobStr: string) {
    // dobStr format is DD/MM/YYYY
    const parts = dobStr.split("/");
    if (parts.length !== 3) return 0;
    const dob = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function getAgeGroup(age: number) {
    if (age < 20) return "10-20";
    if (age < 30) return "20-30";
    if (age < 40) return "30-40";
    if (age < 50) return "40-50";
    if (age < 60) return "50-60";
    if (age < 70) return "60-70";
    return "70>";
}

// Pseudo AI generator if AI toggle is ON
function generateAIPopup(ageGroup: string) {
    const aiResponses: Record<string, string[]> = {
        "10-20": ["(AI) Enerjin yüksek, sağlığını korumaya devam et!", "(AI) Genç yaşta doğru karar verdin."],
        "20-30": ["(AI) Hayatının baharındasın, derin bir nefes al.", "(AI) Kendine yaptığın en iyi yatırım bu."],
        "30-40": ["(AI) Güçlü iraden için tebrikler, bugün harika geçecek!", "(AI) Sağlıklı yıllar seni bekliyor."],
        "40-50": ["(AI) Vücudun kendini yeniliyor, harika gidiyorsun.", "(AI) Daha zinde hissetmeye başladın, devam et."],
        "50-60": ["(AI) Sağlığına değer verdiğin için teşekkür et, bugün güzel bir gün.", "(AI) Derin nefesler hayatını tazeliyor."],
        "60-70": ["(AI) Sevdiklerinle daha taze bir nefes.", "(AI) Sağlıklı günler seninle."],
        "70>": ["(AI) Bedenin bu güzel iyiliği hak ediyor.", "(AI) Tertemiz bir nefesle güne başla."]
    };
    const list = aiResponses[ageGroup] || ["(AI) İyi günler!"];
    return list[Math.floor(Math.random() * list.length)];
}

export default async function SigarayaDurDeLoginPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_token")?.value;

    if (userId) {
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
        if (user) {
            const gmt3Date = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
            const todayStr = `${gmt3Date.getFullYear()}-${String(gmt3Date.getMonth() + 1).padStart(2, '0')}-${String(gmt3Date.getDate()).padStart(2, '0')}`;

            // Check if we should show popup (they logged in today)
            let showPopup = false;
            let displayMessage = "";
            let age = calculateAge(user.dob);

            if (user.last_login_date === todayStr) {
                showPopup = true;
                const ageGroup = getAgeGroup(age);

                // Determine Mode (AI vs Manual)
                const settingRow = db.prepare("SELECT value FROM settings WHERE key = 'ai_toggle'").get() as any;
                const isAiOn = settingRow?.value === "true";

                if (isAiOn) {
                    displayMessage = generateAIPopup(ageGroup);
                } else {
                    // Manual mode
                    const messageRow = db.prepare("SELECT message FROM daily_messages WHERE target_date = ? AND age_group = ?").get(todayStr, ageGroup) as any;
                    displayMessage = messageRow?.message || "Tebrikler! Sigarasız yeni bir gün.";
                }
            }

            return (
                <main style={{ padding: "1rem" }}>
                    {showPopup && <DailyPopup message={displayMessage} age={age} />}
                    <div className="glass-panel" style={{ maxWidth: "600px", margin: "10vh auto", textAlign: "center" }}>
                        <h1 className="page-title">Hoş Geldiniz, {user.name}!</h1>
                        <p className="page-subtitle" style={{ marginTop: "1rem" }}>Sigarayı bırakma yolculuğunuzda başarılar dileriz.</p>

                        <div style={{ marginTop: "2rem", padding: "1.5rem", background: "var(--input-bg)", borderRadius: "12px", border: "1px solid var(--input-border)" }}>
                            <p><strong>Dumansız Hayata Başlangıç:</strong> {user.smoke_start_date}</p>
                            <p style={{ marginTop: "0.5rem", color: "var(--success)" }}><strong>Bugün Platforma Giriş Yaptınız! ({user.daily_login_count}. giriş)</strong></p>
                        </div>

                        <form action={async () => {
                            "use server";
                            const cookieHelpers = await cookies();
                            cookieHelpers.delete("user_token");
                        }}>
                            <button className="btn-primary" style={{ marginTop: "2rem", width: "auto", padding: "0.5rem 2rem" }}>
                                Çıkış Yap
                            </button>
                        </form>
                    </div>
                </main>
            );
        }
    }

    return (
        <main style={{ padding: "1rem" }}>
            <UserLoginForm />
        </main>
    );
}
