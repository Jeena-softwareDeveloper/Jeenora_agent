import * as dotenv from "dotenv";

dotenv.config();

/**
 * Senior Developer Tip: 
 * Always validate environment variables at startup to avoid 
 * cryptic errors later in the execution.
 */
export const config = {
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
  },
  tavily: {
    apiKey: process.env.TAVILY_API_KEY || "",
  },
};

// Simple validation
const missingKeys = [];
if (!config.deepseek.apiKey) missingKeys.push("DEEPSEEK_API_KEY");
if (!config.telegram.token) missingKeys.push("TELEGRAM_BOT_TOKEN");

if (missingKeys.length > 0) {
  console.error(`❌ CRITICAL: Missing environment variables: ${missingKeys.join(", ")}`);
  process.exit(1);
}
