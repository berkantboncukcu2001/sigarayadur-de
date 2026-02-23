"use client";

import { useState } from "react";

const ITEMS_PER_PAGE = 10;

export default function UserTable({ users }: { users: any[] }) {
    const [showUsers, setShowUsers] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <button
                        className="btn-primary"
                        onClick={() => setShowUsers(!showUsers)}
                        style={{ width: "auto", padding: "0.5rem 1.5rem", marginBottom: "1rem" }}
                    >
                        {showUsers ? "Kullanıcı Bilgilerini Gizle" : "Kullanıcı Bilgileri"}
                    </button>
                    <p style={{ fontWeight: "bold" }}>Toplam Kullanıcı Sayısı: {users.length}</p>
                </div>

                {showUsers && totalPages > 1 && (
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "var(--input-bg)", color: "white", border: "1px solid var(--input-border)", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                        >
                            &larr;
                        </button>
                        <span>Sayfa {currentPage} / {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "var(--input-bg)", color: "white", border: "1px solid var(--input-border)", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                        >
                            &rarr;
                        </button>
                    </div>
                )}
            </div>

            {showUsers && (
                <div style={{ overflowX: "auto", marginTop: "1.5rem" }}>
                    {users.length === 0 ? (
                        <p style={{ opacity: 0.7 }}>Henüz kayıtlı kullanıcı bulunmamaktadır.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                                    <th style={{ padding: "1rem" }}>Sıra</th>
                                    <th style={{ padding: "1rem" }}>Ad</th>
                                    <th style={{ padding: "1rem" }}>Soy Ad</th>
                                    <th style={{ padding: "1rem" }}>TC Kimlik No</th>
                                    <th style={{ padding: "1rem" }}>Doğum Tarihi / Yaş</th>
                                    <th style={{ padding: "1rem" }}>Cinsiyet</th>
                                    <th style={{ padding: "1rem" }}>Sigaraya Başlama Zamanı</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map((u, index) => {
                                    // Calculate Age
                                    const parts = u.dob.split("/");
                                    const dobDate = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date();
                                    const age = Math.floor((Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

                                    return (
                                        <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            <td style={{ padding: "1rem", opacity: 0.7 }}>{startIndex + index + 1}</td>
                                            <td style={{ padding: "1rem", fontWeight: 500 }}>{u.name}</td>
                                            <td style={{ padding: "1rem" }}>{u.surname}</td>
                                            <td style={{ padding: "1rem" }}>{u.tc_no}</td>
                                            <td style={{ padding: "1rem" }}>{u.dob} ({age || "?"} Yaş)</td>
                                            <td style={{ padding: "1rem" }}>{u.gender}</td>
                                            <td style={{ padding: "1rem" }}>{u.smoke_start_date}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
