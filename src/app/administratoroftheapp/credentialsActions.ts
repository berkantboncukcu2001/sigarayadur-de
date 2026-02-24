"use server";

import db from "@/lib/db";

export async function fetchCredentials(page: number = 1, searchQuery: string = "") {
    const limit = 100;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM government_credentials";
    let countQuery = "SELECT COUNT(*) as total FROM government_credentials";
    const params: string[] = [];

    if (searchQuery) {
        query += " WHERE name LIKE ? OR surname LIKE ? OR tc_no LIKE ?";
        countQuery += " WHERE name LIKE ? OR surname LIKE ? OR tc_no LIKE ?";
        const wrappedSearch = `%${searchQuery}%`;
        params.push(wrappedSearch, wrappedSearch, wrappedSearch);
    }

    query += " LIMIT ? OFFSET ?";

    const students = db.prepare(query).all(...params, limit, offset) as any[];
    const countRes = db.prepare(countQuery).get(...params) as any;

    return {
        data: students,
        totalPages: Math.ceil(countRes.total / limit),
        totalCount: countRes.total
    };
}
