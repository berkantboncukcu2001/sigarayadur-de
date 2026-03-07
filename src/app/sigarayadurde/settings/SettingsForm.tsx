"use client";

import { useState } from "react";
import { changePassword } from "./actions";

export default function SettingsForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordRepeat, setNewPasswordRepeat] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (newPassword !== newPasswordRepeat) {
            setError("Yeni şifreler eşleşmiyor.");
            return;
        }

        setLoading(true);
        const res = await changePassword(currentPassword, newPassword);
        if (res.success) {
            setMessage("Şifreniz başarıyla değiştirildi.");
            setCurrentPassword("");
            setNewPassword("");
            setNewPasswordRepeat("");
        } else {
            setError(res.error || "Şifre değiştirilirken bir hata oluştu.");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && <div className="alert-message" style={{ background: "rgba(255,0,0,0.1)", color: "var(--error)", padding: "1rem", textAlign: "left" }}>{error}</div>}
            {message && <div className="alert-message" style={{ background: "rgba(0,255,0,0.1)", color: "var(--success)", padding: "1rem", textAlign: "left" }}>{message}</div>}

            <div className="form-group">
                <label className="form-label">Mevcut Şifre</label>
                <input
                    type="password"
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label">Yeni Şifre</label>
                <input
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label">Yeni Şifre (Tekrar)</label>
                <input
                    type="password"
                    className="form-input"
                    value={newPasswordRepeat}
                    onChange={(e) => setNewPasswordRepeat(e.target.value)}
                    required
                />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: "1rem" }}>
                {loading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
            </button>
        </form>
    );
}
