import { bundle, db } from "@/utils/db";

await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

const conn = await db.connect();
await conn.query("PRAGMA enable_verification");
await conn.query("INSTALL excel FROM core_nightly");
await conn.query("LOAD excel");
await conn.close();
