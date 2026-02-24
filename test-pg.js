const { Pool } = require('pg');

const db = new Pool({
    connectionString: "postgresql://neondb_owner:npg_SyiKhQIG95Cu@ep-rough-mountain-agez6653-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require",
});

async function test() {
    try {
        console.log("Testing connection...");
        const res = await db.query("SELECT NOW()");
        console.log("Success! Time is:", res.rows[0]);
    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        process.exit();
    }
}

test();
