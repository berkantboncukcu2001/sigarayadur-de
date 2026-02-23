"use client";

import { useState } from "react";
import { adminLogin } from "./actions";

export default function LoginForm() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await adminLogin(formData);

        if (result.success) {
            window.location.reload(); // Reload to let Server Component see cookie
        } else {
            setError(result.error || "Giriş başarısız.");
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: "400px", margin: "10vh auto" }}>
            <h1 className="page-title">Yönetici Girişi</h1>
            <p className="page-subtitle">Sisteme erişmek için kimlik bilgilerinizi giriniz.</p>

            {error && <div className="alert-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Kullanıcı Adı</label>
                    <input
                        type="text"
                        name="username"
                        className="form-input"
                        required
                        autoComplete="username"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Şifre</label>
                    <input
                        type="password"
                        name="password"
                        className="form-input"
                        required
                        autoComplete="current-password"
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>
            </form>
        </div>
    );
}
