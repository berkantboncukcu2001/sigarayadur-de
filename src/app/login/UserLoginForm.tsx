"use client";

import { useState } from "react";
import { loginUser } from "./actions";

export default function UserLoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await loginUser(formData);

        if (result.success) {
            setSuccess(true);
            // Wait then reload or redirect
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            setError(result.error || "Giriş başarısız.");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="glass-panel" style={{ maxWidth: "400px", margin: "10vh auto", textAlign: "center" }}>
                <h2 style={{ color: "var(--success)" }}>Giriş Başarılı!</h2>
                <p style={{ marginTop: "1rem" }}>Hoş geldiniz, yönlendiriliyorsunuz...</p>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ maxWidth: "400px", margin: "10vh auto" }}>
            <h1 className="page-title">Giriş Yap</h1>
            <p className="page-subtitle">Hesabınıza erişmek için bilgilerinizi giriniz.</p>

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

                <div className="checkbox-group">
                    <input type="checkbox" id="remember" name="remember" className="checkbox-input" />
                    <label htmlFor="remember" className="form-label" style={{ marginBottom: 0 }}>
                        Beni Hatırla
                    </label>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
                    {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>

                <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", opacity: 0.8 }}>
                    Hesabınız yok mu? <a href="/register" style={{ color: "var(--primary-hover)", textDecoration: "none", fontWeight: "bold" }}>Kayıt Ol</a>
                </p>
            </form>
        </div>
    );
}
