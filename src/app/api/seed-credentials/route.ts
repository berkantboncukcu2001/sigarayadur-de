import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const { rows } = await db.query("SELECT COUNT(*) as count FROM government_credentials");
        const countRes = rows[0];
        if (parseInt(countRes.count) > 0) {
            return NextResponse.json({ message: "Already seeded", count: countRes.count });
        }

        const names = ["Aleyna", "Ayşe", "Fatma", "Ahmet", "Mehmet", "Ali", "Veli", "Kemal", "Mustafa", "Can", "Deniz", "Ebru", "Gizem", "Hakan"];
        const surnames = ["Kaya", "Yılmaz", "Çelik", "Demir", "Yıldız", "Şahin", "Öztürk", "Aydın", "Özdemir", "Arslan"];

        let count = 0;
        for (let i = 0; i < 300; i++) {
            const n = names[Math.floor(Math.random() * names.length)];
            const s = surnames[Math.floor(Math.random() * surnames.length)];
            const tc = Math.floor(10000000000 + Math.random() * 90000000000).toString(); // 11 digit random

            try {
                await db.query("INSERT INTO government_credentials (name, surname, tc_no) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [n, s, tc]);
                count++;
            } catch (e) {
                // ignore unique constraint failures on random generation
            }
        }

        // Add a specific one for testing
        try {
            await db.query("INSERT INTO government_credentials (name, surname, tc_no) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", ["Berkant", "Boncukçu", "12345678901"]);
        } catch (e) { }

        return NextResponse.json({ message: "Successfully seeded", added: count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
