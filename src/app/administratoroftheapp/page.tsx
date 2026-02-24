import { cookies } from "next/headers";
import db from "@/lib/db";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";
import UserTable from "./UserTable";
import HistoricalFeedbacks from "./HistoricalFeedbacks";
import CredentialsTable from "./CredentialsTable";

export const dynamic = "force-dynamic"; // Ensure it always fetches fresh data

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("admin_token")?.value === "authenticated";

    if (!isAdmin) {
        return (
            <main style={{ padding: "2rem" }}>
                <LoginForm />
            </main>
        );
    }

    // Fetch users from SQLite
    const users = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all() as any[];

    // Fetch settings and daily messages for historical feedbacks
    const settingRow = db.prepare("SELECT value FROM settings WHERE key = 'ai_toggle'").get() as any;
    const isAiOn = settingRow?.value === "true";

    const allMessages = db.prepare("SELECT * FROM daily_messages").all() as any[];
    const messagesObj: Record<string, string> = {};
    for (const msg of allMessages) {
        messagesObj[`${msg.target_date}|${msg.age_group}`] = msg.message;
    }

    return (
        <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 className="page-title" style={{ textAlign: "left", marginBottom: 0 }}>Yönetici Paneli</h1>
                <LogoutButton />
            </div>

            <UserTable users={users} />
            <CredentialsTable />
            <HistoricalFeedbacks initialAiMode={isAiOn} messagesObj={messagesObj} />
        </main>
    );
}
