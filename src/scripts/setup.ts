import { bundle, db } from "@/utils/db";

await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
