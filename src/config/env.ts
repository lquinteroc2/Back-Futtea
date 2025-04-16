import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export const PORT: number = Number(process.env.PORT) || 3000;
export const DB_NAME: string = process.env.DB_NAME || "beandorlocal";
export const DB_USER: string = process.env.DB_USER || "postgres";
export const DB_PASSWORD: string = process.env.DB_PASSWORD || "admin";
export const DB_HOST: string = process.env.DB_HOST || "localhost";
export const DB_PORT: number = Number(process.env.DB_PORT) || 5432;
export const JWT_SECRET: string = process.env.JWT_SECRET || "secret";
export const DATABASE_URL: string = process.env.DATABASE_URL || "";
export const EMAIL_USER: string = process.env.EMAIL_USER || "beandorforms@gmail.com";
export const EMAIL_PASS: string = process.env.EMAIL_PASS || "";

// // 🔹 Variables para WhatsApp Cloud API
// export const WHATSAPP_API_URL: string = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v22.0";
// export const PHONE_NUMBER_ID: string = process.env.PHONE_NUMBER_ID || "";
// export const ACCESS_TOKEN: string = process.env.ACCESS_TOKEN || "";
// export const VERIFY_TOKEN: string = process.env.VERIFY_TOKEN || "";
// export const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || "";
// export const GEMINI_API_KEY: string = process.env.GEMINI_API_KEY || "";
// export const WHATSAPP_CONTACT_NUMBER: string = process.env.WHATSAPP_CONTACT_NUMBER || "";
// export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "andeanbearforms@gmail.com";
// export const CONTACT_PHONE = process.env.CONTACT_PHONE || "573203338551";

