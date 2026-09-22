import { Temporal } from "@js-temporal/polyfill";

(globalThis as typeof globalThis & {
  Temporal: typeof Temporal;
}).Temporal = Temporal;

import postgres from "@prisma/orm-postgres/runtime";

import type { Contract } from "../../prisma/contract.d";
import contractJson from "../../prisma/contract.json";

import { env } from "../config/env.js";

export const db = postgres<Contract>({
  contractJson,
  url: env.DATABASE_URL,
});