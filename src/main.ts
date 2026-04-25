import { TelegramService } from "./services/telegramService";

/**
 * Senior Developer Entry Point
 */
async function bootstrap() {
  try {
    const telegramService = new TelegramService();
    telegramService.start();
    
    console.log("🚀 Application bootstrapped successfully.");
  } catch (error) {
    console.error("💥 Failed to start application:", error);
    process.exit(1);
  }
}

bootstrap();
