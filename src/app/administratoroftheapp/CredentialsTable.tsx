"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { fetchCredentials, bulkImportCredentials, addSingleCredential } from "./credentialsActions";

type Credential = {
    id: number;
    name: string;
    surname: string;
    tc_no: string;
};

export default function CredentialsTable() {
    const [isVisible, setIsVisible] = useState(false);

    // Bulk Upload States
    const [loadingBulk, setLoadingBulk] = useState(false);
    const [bulkMessage, setBulkMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Single Insert States
    const [showSingleModal, setShowSingleModal] = useState(false);
    const [singleInput, setSingleInput] = useState({ name: "", surname: "", tc_no: "" });
    const [singleLoading, setSingleLoading] = useState(false);
    const [singleMessage, setSingleMessage] = useState("");

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoadingBulk(true);
        setBulkMessage("Dosya okunuyor...");

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const records: any[] = [];
                results.data.forEach((row: any) => {
                    const vals = Object.values(row);
                    const name = row.Ad || row.Name || row.name || row.ad || row.AD || vals[0];
                    const surname = row.Soyad || row.Surname || row.surname || row["Soy Ad"] || row.SOYAD || vals[1];
                    const tc_no = row.TC || row.TC_No || row.tc_no || row["TC Kimlik"] || row["TC Kimlik No"] || vals[2];

                    if (name && surname && tc_no) {
                        records.push({ name: String(name).trim(), surname: String(surname).trim(), tc_no: String(tc_no).trim() });
                    }
                });

                if (records.length === 0) {
                    setBulkMessage("Uygun veri bulunamadı. Lütfen CSV dosyasının sütun başlıklarını kontrol ediniz.");
                    setLoadingBulk(false);
                    return;
                }

                setBulkMessage(`${records.length} kayıt veritabanına gönderiliyor...`);

                try {
                    const res = await bulkImportCredentials(records);
                    if (res.success) {
                        setBulkMessage(`Başarılı! ${res.count} yeni kişi sisteme eklendi.`);
                        loadData(1, searchQuery); // Reload table
                    } else {
                        setBulkMessage(`Hata: ${res.error}`);
                    }
                } catch (err: any) {
                    setBulkMessage(`Sunucu hatası: ${err.message}`);
                }
                setLoadingBulk(false);
                // Reset file input
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            error: (err: any) => {
                setBulkMessage(`Dosya okuma hatası: ${err.message}`);
                setLoadingBulk(false);
            }
        });
    };
    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSingleLoading(true);
        setSingleMessage("");
        try {
            const res = await addSingleCredential(singleInput.name, singleInput.surname, singleInput.tc_no);
            if (res.success) {
                setSingleMessage("Kişi başarıyla eklendi.");
                setSingleInput({ name: "", surname: "", tc_no: "" });
                loadData(1, searchQuery); // Reload table
                setTimeout(() => {
                    setShowSingleModal(false);
                    setSingleMessage("");
                }, 1500);
            } else {
                setSingleMessage(res.error || "Hata oluştu.");
            }
        } catch (err: any) {
            setSingleMessage(`Sunucu hatası: ${err.message}`);
        }
        setSingleLoading(false);
    };
    const [data, setData] = useState<Credential[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    // Security Trap State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [passwordInput, setPasswordInput] = useState("");
    const [unlockedRows, setUnlockedRows] = useState<Set<number>>(new Set());
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [passwordError, setPasswordError] = useState("");

    const TARGET_PASSWORD = "16171617Bb";

    const loadData = async (p: number, search: string) => {
        const result = await fetchCredentials(p, search);
        setData(result.data);
        setTotalPages(result.totalPages || 1);
    };

    useEffect(() => {
        if (isVisible) {
            loadData(page, searchQuery);
        }
    }, [isVisible, page, searchQuery]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const maskText = (text: string) => {
        if (text.length <= 2) return text + "***";
        return text.substring(0, 2) + "*".repeat(text.length - 2);
    };

    const handleRowClick = (id: number) => {
        if (unlockedRows.has(id)) return; // Already unlocked
        setSelectedRowId(id);
        setShowPasswordModal(true);
        setFailedAttempts(0);
        setPasswordInput("");
        setPasswordError("");
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordInput === TARGET_PASSWORD) {
            if (failedAttempts === 0) {
                // The Trap: First correct attempt fails!
                setFailedAttempts(1);
                setPasswordError("Yanlış şifre.");
                setPasswordInput("");
            } else {
                // Second consecutive correct attempt succeeds
                setUnlockedRows(prev => {
                    const next = new Set(prev);
                    if (selectedRowId !== null) next.add(selectedRowId);
                    return next;
                });
                // DO NOT close the modal, let it switch to the unmasked data view
            }
        } else {
            // Wrong password entirely
            setPasswordError("Yanlış şifre.");
            setPasswordInput("");
            setFailedAttempts(0); // Reset trap if they enter completely wrong password
        }
    };

    const getSelectedCredential = () => data.find(c => c.id === selectedRowId);

    const renderModals = () => (
        <>
            {/* Security Modal */}
            {showPasswordModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
                }}>
                    <div className="glass-panel" style={{ padding: "2rem", width: "90%", maxWidth: "450px", textAlign: "center" }}>

                        {/* If unlocked, show the unmasked data ONLY in this modal */}
                        {selectedRowId && unlockedRows.has(selectedRowId) ? (
                            <div>
                                <h3 style={{ marginBottom: "1.5rem", color: "var(--primary)" }}>Kimlik Verisi Açıldı</h3>
                                <div style={{ background: "var(--input-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--input-border)", textAlign: "left", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div><strong style={{ opacity: 0.7 }}>Ad:</strong> <span style={{ fontSize: "1.2rem", display: "block" }}>{getSelectedCredential()?.name}</span></div>
                                    <div><strong style={{ opacity: 0.7 }}>Soyad:</strong> <span style={{ fontSize: "1.2rem", display: "block" }}>{getSelectedCredential()?.surname}</span></div>
                                    <div><strong style={{ opacity: 0.7 }}>Öğrenci Numarası:</strong> <span style={{ fontSize: "1.2rem", display: "block" }}>{getSelectedCredential()?.tc_no}</span></div>
                                </div>
                                <button
                                    onClick={() => {
                                        // Re-lock when closing
                                        setUnlockedRows(prev => {
                                            const next = new Set(prev);
                                            next.delete(selectedRowId);
                                            return next;
                                        });
                                        setShowPasswordModal(false);
                                    }}
                                    className="btn-primary"
                                    style={{ marginTop: "2rem" }}
                                >
                                    Kapat ve Şifrele
                                </button>
                            </div>
                        ) : (
                            // Trap Form
                            <>
                                <h3 style={{ marginBottom: "1rem" }}>Güvenlik Doğrulaması</h3>
                                <p style={{ opacity: 0.8, marginBottom: "1.5rem", fontSize: "0.9rem" }}>Bu kaydın maskesini kaldırmak için yönetici şifresini giriniz.</p>

                                <form onSubmit={handlePasswordSubmit}>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="Şifre"
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                    {passwordError && <div style={{ color: "var(--error)", marginTop: "0.5rem", fontSize: "0.9em" }}>{passwordError}</div>}

                                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                                        <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-primary" style={{ background: "transparent", border: "1px solid var(--input-border)", color: "var(--primary)" }}>
                                            İptal
                                        </button>
                                        <button type="submit" className="btn-primary">
                                            Doğrula
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                    </div>
                </div>
            )}

            {/* Add Single Credential Modal */}
            {showSingleModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
                }}>
                    <div className="glass-panel" style={{ padding: "2rem", width: "90%", maxWidth: "450px", textAlign: "left" }}>
                        <h3 style={{ marginBottom: "1rem" }}>Kişisel Veri Ekle</h3>
                        <p style={{ opacity: 0.8, marginBottom: "1.5rem", fontSize: "0.9rem" }}>Sisteme anında manuel olarak tek bir kimlik onay verisi ekleyin.</p>

                        <form onSubmit={handleSingleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Ad</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={singleInput.name}
                                    onChange={(e) => setSingleInput({ ...singleInput, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Soy Ad</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={singleInput.surname}
                                    onChange={(e) => setSingleInput({ ...singleInput, surname: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Öğrenci Numarası</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={singleInput.tc_no}
                                    onChange={(e) => setSingleInput({ ...singleInput, tc_no: e.target.value })}
                                    maxLength={15}
                                    required
                                />
                            </div>

                            {singleMessage && (
                                <div style={{ color: singleMessage.includes("Hata") ? "var(--error)" : "var(--success)", fontSize: "0.9em", textAlign: "center" }}>
                                    {singleMessage}
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setShowSingleModal(false)} className="btn-primary" style={{ background: "transparent", border: "1px solid var(--input-border)", color: "var(--primary)" }}>
                                    İptal
                                </button>
                                <button type="submit" disabled={singleLoading} className="btn-primary">
                                    {singleLoading ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );

    if (!isVisible) {
        return (
            <>
                <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
                    <button onClick={() => setIsVisible(true)} className="btn-primary" style={{ width: "auto" }}>
                        Credentials Data (Gizli Veriler)
                    </button>
                    <div style={{ position: "relative" }}>
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-primary"
                            style={{ width: "auto", background: "var(--primary-hover)" }}
                            disabled={loadingBulk}
                        >
                            {loadingBulk ? "Yükleniyor..." : "Toplu Veri Yükle (CSV)"}
                        </button>
                        {bulkMessage && (
                            <div style={{ position: "absolute", top: "110%", left: 0, whiteSpace: "nowrap", fontSize: "0.85rem", color: "var(--light)", background: "var(--glass-bg)", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--glass-border)", zIndex: 10 }}>
                                {bulkMessage}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowSingleModal(true)}
                        className="btn-primary"
                        style={{ width: "auto" }}
                    >
                        Kişisel Veri Ekle
                    </button>
                </div>
                {renderModals()}
            </>
        );
    }

    return (
        <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2>Credentials Data (Resmi Kayıtlar)</h2>
                <button
                    onClick={() => setIsVisible(false)}
                    className="btn-primary"
                    style={{ width: "auto", background: "var(--input-bg)", color: "var(--primary)", padding: "0.5rem 1rem", fontSize: "1.2rem", lineHeight: 1 }}
                    title="Kapat"
                >
                    &times;
                </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <input
                    type="text"
                    placeholder="Ad, Soyad veya Öğrenci Numarası Ara..."
                    className="form-input"
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                            <th style={{ padding: "1rem", color: "var(--primary-hover)" }}>Ad</th>
                            <th style={{ padding: "1rem", color: "var(--primary-hover)" }}>Soy Ad</th>
                            <th style={{ padding: "1rem", color: "var(--primary-hover)" }}>Öğrenci Numarası</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => {
                            return (
                                <tr
                                    key={item.id}
                                    onClick={() => handleRowClick(item.id)}
                                    style={{
                                        borderBottom: "1px solid var(--glass-border)",
                                        cursor: "pointer",
                                        transition: "background 0.2s"
                                    }}
                                    className="table-row-hover"
                                >
                                    <td style={{ padding: "1rem" }}>{maskText(item.name)}</td>
                                    <td style={{ padding: "1rem" }}>{maskText(item.surname)}</td>
                                    <td style={{ padding: "1rem" }}>{maskText(item.tc_no)}</td>
                                </tr>
                            );
                        })}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={3} style={{ padding: "2rem", textAlign: "center", opacity: 0.7 }}>Kayıt bulunamadı.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem", gap: "1rem" }}>
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn-primary"
                    style={{ width: "auto", padding: "0.5rem 1rem", opacity: page === 1 ? 0.5 : 1 }}
                >
                    &larr;
                </button>
                <span>Sayfa {page} / {totalPages}</span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="btn-primary"
                    style={{ width: "auto", padding: "0.5rem 1rem", opacity: page >= totalPages ? 0.5 : 1 }}
                >
                    &rarr;
                </button>
            </div>

            {renderModals()}
        </div>
    );
}
