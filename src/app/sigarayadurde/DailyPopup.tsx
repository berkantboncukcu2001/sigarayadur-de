"use client";

import { useState } from "react";

export default function DailyPopup({ message, age }: { message: string, age: number }) {
    const [open, setOpen] = useState(true);

    if (!open) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
            <div className="glass-panel" style={{ maxWidth: "500px", width: "90%", textAlign: "center", position: "relative" }}>
                <button
                    onClick={() => setOpen(false)}
                    style={{ position: "absolute", top: "1rem", right: "1rem", background: "transparent", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}
                >
                    &times;
                </button>
                <h2 style={{ marginBottom: "1rem", color: "var(--primary-hover)" }}>Günün Mesajı</h2>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>{message}</p>
            </div>
        </div>
    );
}
