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
