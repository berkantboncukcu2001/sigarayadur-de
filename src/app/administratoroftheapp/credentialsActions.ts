"use server";

import db from "@/lib/db";

export async function fetchCredentials(page: number = 1, searchQuery: string = "") {
    const limit = 100;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM government_credentials";
    let countQuery = "SELECT COUNT(*) as total FROM government_credentials";
    const params: any[] = [];
    let paramIndex = 1;

    if (searchQuery) {
        query += ` WHERE name ILIKE $${paramIndex} OR surname ILIKE $${paramIndex + 1} OR tc_no ILIKE $${paramIndex + 2}`;
        countQuery += ` WHERE name ILIKE $${paramIndex} OR surname ILIKE $${paramIndex + 1} OR tc_no ILIKE $${paramIndex + 2}`;
        const wrappedSearch = `%${searchQuery}%`;
        params.push(wrappedSearch, wrappedSearch, wrappedSearch);
        paramIndex += 3;
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const queryParams = [...params, limit, offset];

    const { rows: students } = await db.query(query, queryParams);
    const { rows: countRes } = await db.query(countQuery, params);

    return {
        data: students,
        totalPages: Math.ceil(parseInt(countRes[0].total) / limit),
        totalCount: parseInt(countRes[0].total)
    };
}

export async function bulkImportCredentials(records: { name: string, surname: string, tc_no: string }[]) {
    if (!records || records.length === 0) return { success: false, error: "Yüklenecek veri bulunamadı." };

    const batchSize = 1000;
    let insertedRows = 0;

    try {
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            const values: any[] = [];

            const placeholders = batch.map((r, index) => {
                const offset = index * 3;
                values.push(r.name, r.surname, r.tc_no);
                return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
            }).join(', ');

            const query = `
                INSERT INTO government_credentials (name, surname, tc_no)
                VALUES ${placeholders}
                ON CONFLICT (tc_no) DO NOTHING
            `;

            const res = await db.query(query, values);
            insertedRows += res.rowCount || 0;
        }

        return { success: true, count: insertedRows };
    } catch (e: any) {
        console.error(e);
        return { success: false, error: e.message };
    }
}
