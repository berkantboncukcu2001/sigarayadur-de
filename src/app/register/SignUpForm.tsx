"use client";

import { useState } from "react";
import { registerUser } from "./actions";

export default function SignUpForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");

    // Cigarettes input
    const [cigValue, setCigValue] = useState("10");

    // Date inputs
    const [dob, setDob] = useState("");
    const [smokeStart, setSmokeStart] = useState("");

    const formatDateInput = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        // Password validation (min 8 chars, 1 letter, 1 number)
        const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passRegex.test(password)) {
            setError("Şifreniz en az 8 karakter uzunluğunda olmalı ve hem harf hem de rakam içermelidir.");
            return;
        }

        if (password !== repeatedPassword) {
            setError("Şifreler birbiriyle eşleşmiyor.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            formData.set("cigarettes_per_day", cigValue);
            formData.set("dob", dob);
            formData.set("smoke_start_date", smokeStart);

            const result = await registerUser(formData);

            if (result.success) {
                setSuccess(true);
                // Wait a moment then redirect to login
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else {
                setError(result.error || "Bilinmeyen bir hata oluştu.");
                if (result.error?.includes("mevcut")) {
                    alert("DİKKAT: " + result.error); // Fallback alert window as requested
                }
                setLoading(false);
            }
        } catch (err: any) {
            console.error(err);
            setError("Kayıt işlemi sırasında sunucu hatası oluştu. Veritabanı bağliantınızı kontrol ediniz.");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="glass-panel" style={{ maxWidth: "500px", margin: "10vh auto", textAlign: "center" }}>
                <h2 style={{ color: "var(--success)" }}>Kayıt Başarılı!</h2>
                <p style={{ marginTop: "1rem" }}>Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ maxWidth: "600px", margin: "5vh auto" }}>
            <h1 className="page-title">Sigaraya Dur De</h1>
            <p className="page-subtitle">Dumansız bir hayata adım atmak için kayıt olun.</p>

            {error && <div className="alert-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                        <label className="form-label">Adınız</label>
                        <input type="text" name="name" className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Soyadınız</label>
                        <input type="text" name="surname" className="form-input" required />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                        <label className="form-label">Kullanıcı Adı (Sisteme giriş için)</label>
                        <input type="text" name="username" className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">TC Kimlik No</label>
                        <input
                            type="text"
                            name="tc_no"
                            className="form-input"
                            maxLength={11}
                            pattern="^[0-9]{11}$"
                            title="Lütfen 11 haneli TC Kimlik numaranızı giriniz"
                            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("Lütfen 11 haneli TC Kimlik numaranızı giriniz")}
                            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                        <label className="form-label">Şifre</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Şifre (Tekrar)</label>
                        <input
                            type="password"
                            className="form-input"
                            value={repeatedPassword}
                            onChange={(e) => setRepeatedPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                        <label className="form-label">Doğum Tarihi</label>
                        <input
                            type="text"
                            placeholder="GG/AA/YYYY"
                            className="form-input"
                            value={dob}
                            onChange={(e) => setDob(formatDateInput(e.target.value))}
                            maxLength={10}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Cinsiyet</label>
                        <select name="gender" className="form-input" required>
                            <option value="">Seçiniz</option>
                            <option value="Erkek">Erkek</option>
                            <option value="Kadın">Kadın</option>
                            <option value="Diğer">Diğer</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Sigaraya Başlama Tarihi</label>
                    <input
                        type="text"
                        placeholder="GG/AA/YYYY"
                        className="form-input"
                        value={smokeStart}
                        onChange={(e) => setSmokeStart(formatDateInput(e.target.value))}
                        maxLength={10}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Günde Ne Kadar Sigara İçiyorsunuz?</label>
                    <input
                        type="number"
                        className="form-input"
                        min="1"
                        value={cigValue}
                        onChange={(e) => setCigValue(e.target.value)}
                        required
                    />
                </div>

                <div className="checkbox-group" style={{ marginTop: "2rem" }}>
                    <input type="checkbox" id="agreement" className="checkbox-input" required />
                    <label htmlFor="agreement" className="form-label" style={{ marginBottom: 0 }}>
                        Verilerimin daha iyi hizmet sunulabilmesi amacıyla işlenmesini kabul ediyorum.
                    </label>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
                    {loading ? "Kaydediliyor..." : "Devam Et ve Onayla"}
                </button>

                <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", opacity: 0.8 }}>
                    Zaten hesabınız var mı? <a href="/login" style={{ color: "var(--primary-hover)", textDecoration: "none", fontWeight: "bold" }}>Giriş Yap</a>
                </p>
            </form>
        </div>
    );
}
