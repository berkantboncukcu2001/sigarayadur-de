import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const countRes = db.prepare("SELECT COUNT(*) as count FROM government_credentials").get() as any;
        if (countRes.count > 0) {
            return NextResponse.json({ message: "Already seeded", count: countRes.count });
        }

        const stmt = db.prepare("INSERT INTO government_credentials (name, surname, tc_no) VALUES (?, ?, ?)");

        // Generating some dummy data
        const names = ["Aleyna", "Ayşe", "Fatma", "Ahmet", "Mehmet", "Ali", "Veli", "Kemal", "Mustafa", "Can", "Deniz", "Ebru", "Gizem", "Hakan"];
        const surnames = ["Kaya", "Yılmaz", "Çelik", "Demir", "Yıldız", "Şahin", "Öztürk", "Aydın", "Özdemir", "Arslan"];

        let count = 0;
        for (let i = 0; i < 300; i++) {
            const n = names[Math.floor(Math.random() * names.length)];
            const s = surnames[Math.floor(Math.random() * surnames.length)];
            const tc = Math.floor(10000000000 + Math.random() * 90000000000).toString(); // 11 digit random

            try {
                stmt.run(n, s, tc);
                count++;
            } catch (e) {
                // ignore unique constraint failures on random generation
            }
        }

        // Add a specific one for testing
        try {
            stmt.run("Berkant", "Boncukçu", "12345678901");
        } catch (e) { }

        return NextResponse.json({ message: "Successfully seeded", added: count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
