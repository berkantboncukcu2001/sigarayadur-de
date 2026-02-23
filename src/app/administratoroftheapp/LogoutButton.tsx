"use client";

import { adminLogout } from "./actions";

export default function LogoutButton() {
    const handleLogout = async () => {
        await adminLogout();
        window.location.reload();
    };

    return (
        <button onClick={handleLogout} className="btn-primary" style={{ width: "auto", padding: "0.5rem 1.5rem", background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5" }}>
            Çıkış Yap
        </button>
    );
}
