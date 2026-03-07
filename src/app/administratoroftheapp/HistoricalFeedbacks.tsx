"use client";

import { useState, useRef, useEffect } from "react";
import { saveDailyMessageAction, toggleAiModeAction, saveAllDailyMessagesAction } from "./calendarActions";

const AGE_GROUPS = [
    "10-20", "20-30", "30-40", "40-50", "50-60", "60-70", "70>"
];

export default function HistoricalFeedbacks({
    initialAiMode,
    messagesObj
}: {
    initialAiMode: boolean,
    messagesObj: Record<string, string> // key: "YYYY-MM-DD|AGE", value: "message"
}) {
    const [isAiOn, setIsAiOn] = useState(initialAiMode);

    // Initialize to today
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState("");

    // Set selected date to today on mount
    useEffect(() => {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        setSelectedDateStr(`${y}-${m}-${d}`);
    }, []);

    // Helper to change month
    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const nd = new Date(prev);
            nd.setMonth(nd.getMonth() + offset);
            return nd;
        });
        setSelectedDateStr(null);
    };

    const handleAiToggle = async () => {
        const newVal = !isAiOn;
        setIsAiOn(newVal);
        await toggleAiModeAction(newVal);
    };

    // Generate days of the month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    });

    const handleSaveMessage = async (ageGroup: string, formElement: HTMLFormElement) => {
        if (!selectedDateStr) return;
        const formData = new FormData(formElement);
        const text = formData.get("message")?.toString() || "";
        const res = await saveDailyMessageAction(selectedDateStr, ageGroup, text);
        if (res.success) {
            setSuccessMsg("Başarıyla kaydedildi.");
            setTimeout(() => setSuccessMsg(""), 3000);
        }
    };

    const handleSaveAll = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedDateStr) return;

        const formData = new FormData(e.currentTarget);
        const allMsgs: { ageGroup: string, message: string }[] = [];

        AGE_GROUPS.forEach(age => {
            const text = formData.get(`message_${age}`)?.toString() || "";
            allMsgs.push({ ageGroup: age, message: text });
        });

        const res = await saveAllDailyMessagesAction(selectedDateStr, allMsgs);
        if (res.success) {
            setSuccessMsg("Tüm yaş grupları başarıyla kaydedildi.");
            setTimeout(() => setSuccessMsg(""), 3000);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ margin: 0 }}>Tarihsel Geri Dönütler</h2>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {/* Manual Button */}
                    <span
                        onClick={() => { if (isAiOn) handleAiToggle(); }}
                        style={{
                            padding: "0.4rem 0.8rem",
                            borderRadius: "8px",
                            fontWeight: 500,
                            backgroundColor: !isAiOn ? "var(--primary)" : "transparent",
                            color: !isAiOn ? "white" : "inherit",
                            opacity: !isAiOn ? 1 : 0.6,
                            boxShadow: !isAiOn ? "inset 0 3px 6px rgba(0,0,0,0.4)" : "none",
                            transform: !isAiOn ? "translateY(2px)" : "none",
                            border: "1px solid",
                            borderColor: !isAiOn ? "transparent" : "var(--input-border)",
                            cursor: "pointer",
                            transition: "all 0.3s"
                        }}>
                        Manual
                    </span>

                    {/* Toggle Switch UI */}
                    <label style={{
                        position: "relative",
                        display: "inline-block",
                        width: "50px",
                        height: "24px"
                    }}>
                        <input
                            type="checkbox"
                            checked={isAiOn}
                            onChange={handleAiToggle}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: "absolute",
                            cursor: "pointer",
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: isAiOn ? "#f97316" : "var(--primary)", /* Orange for AI, Blue for Manual */
                            transition: ".4s",
                            borderRadius: "24px",
                            border: "1px solid var(--input-border)",
                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)"
                        }}>
                            <span style={{
                                position: "absolute",
                                content: '""',
                                height: "16px",
                                width: "16px",
                                left: isAiOn ? "30px" : "4px",
                                bottom: "3px",
                                backgroundColor: "white",
                                transition: ".4s",
                                borderRadius: "50%",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                            }} />
                        </span>
                    </label>

                    {/* AI Button */}
                    <span
                        onClick={() => { if (!isAiOn) handleAiToggle(); }}
                        style={{
                            padding: "0.4rem 0.8rem",
                            borderRadius: "8px",
                            fontWeight: 500,
                            backgroundColor: isAiOn ? "#f97316" : "transparent", /* Orange background when clicked */
                            color: isAiOn ? "white" : "inherit",
                            opacity: isAiOn ? 1 : 0.6,
                            boxShadow: isAiOn ? "inset 0 3px 6px rgba(0,0,0,0.4)" : "none",
                            transform: isAiOn ? "translateY(2px)" : "none",
                            border: "1px solid",
                            borderColor: isAiOn ? "transparent" : "var(--input-border)",
                            cursor: "pointer",
                            transition: "all 0.3s"
                        }}>
                        AI Called Auto
                    </span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                {/* Calendar Column */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "center" }}>
                        <button onClick={() => changeMonth(-1)} className="btn-primary" style={{ padding: "0.5rem", width: "auto" }}>&larr;</button>
                        <span style={{ fontWeight: "bold" }}>
                            {["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"][currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={() => changeMonth(1)} className="btn-primary" style={{ padding: "0.5rem", width: "auto" }}>&rarr;</button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.5rem", maxHeight: "400px", overflowY: "auto", paddingRight: "0.5rem", alignContent: "start" }}>
                        {days.map(dayStr => {
                            const [y, m, d] = dayStr.split("-");
                            const displayDate = `${d}.${m}.${y}`;
                            const isSelected = selectedDateStr === dayStr;
                            return (
                                <button
                                    key={dayStr}
                                    onClick={() => setSelectedDateStr(dayStr)}
                                    style={{
                                        padding: "0.8rem",
                                        borderRadius: "8px",
                                        background: isSelected ? "var(--primary-glow)" : "var(--input-bg)",
                                        border: `1px solid ${isSelected ? "var(--primary)" : "var(--input-border)"}`,
                                        color: isSelected ? "white" : "inherit",
                                        cursor: "pointer",
                                        textAlign: "center",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {displayDate}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Details Column */}
                <div style={{ background: "var(--input-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--input-border)" }}>
                    {!selectedDateStr ? (
                        <p style={{ opacity: 0.7, textAlign: "center", marginTop: "2rem" }}>Mesaj girmek veya görmek için soldaki takvimden bir gün seçiniz.</p>
                    ) : (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem" }}>
                                <h3 style={{ margin: 0 }}>
                                    {selectedDateStr.split("-").reverse().join(".")} Mesajları
                                </h3>
                                {successMsg && <span style={{ color: "var(--success)", fontWeight: "bold", fontSize: "0.9rem" }}>{successMsg}</span>}
                            </div>

                            <form onSubmit={handleSaveAll} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxHeight: "350px", overflowY: "auto", paddingRight: "0.5rem" }}>
                                {AGE_GROUPS.map(age => {
                                    const dbKey = `${selectedDateStr}|${age}`;
                                    const currentMsg = messagesObj[dbKey] || "";

                                    return (
                                        <div key={age} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                            <label style={{ fontWeight: "bold", color: "var(--primary-hover)" }}>{age} Yaş Grubu:</label>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <input
                                                    type="text"
                                                    name={`message_${age}`}
                                                    defaultValue={currentMsg}
                                                    placeholder={`${age} yaş grubu için mesaj girin...`}
                                                    className="form-input"
                                                    style={{ flex: 1 }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        const form = (e.target as HTMLElement).closest('div')?.querySelector('input') as HTMLInputElement;
                                                        if (!form) return;
                                                        const tempForm = document.createElement("form");
                                                        const inputDesc = document.createElement("input");
                                                        inputDesc.name = "message";
                                                        inputDesc.value = form.value;
                                                        tempForm.appendChild(inputDesc);
                                                        handleSaveMessage(age, tempForm);
                                                    }}
                                                    className="btn-primary"
                                                    style={{ width: "auto", padding: "0.5rem 1rem" }}
                                                >
                                                    Kaydet
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                                <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }}>
                                    Hepsini Kaydet
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
