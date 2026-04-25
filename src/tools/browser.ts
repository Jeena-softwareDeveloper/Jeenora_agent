import puppeteer from "puppeteer";

/**
 * Universal Browser Tool
 * Can perform any action: Navigate, Click, Type, and Scrape.
 * This gives the CEO "All Access" to the web.
 */
export async function useBrowser(actions: { action: 'navigate' | 'click' | 'type' | 'scrape', target?: string, value?: string }[]) {
  console.log(`--- 🌐 UNIVERSAL BROWSER EXECUTING ${actions.length} ACTIONS ---`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    
    const page = await browser.newPage();
    let result = "";

    for (const step of actions) {
      if (step.action === 'navigate' && step.target) {
        await page.goto(step.target, { waitUntil: "networkidle2" });
        result += `Navigated to ${step.target}\n`;
      } 
      else if (step.action === 'click' && step.target) {
        await page.click(step.target);
        await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => null);
        result += `Clicked ${step.target}\n`;
      }
      else if (step.action === 'type' && step.target && step.value) {
        await page.type(step.target, step.value);
        result += `Typed into ${step.target}\n`;
      }
      else if (step.action === 'scrape') {
        const content = await page.content();
        result += `Scraped page content (Length: ${content.length})\n`;
      }
    }

    await browser.close();
    return result;

  } catch (error) {
    console.error("Browser Action Error:", error);
    if (browser) await browser.close();
    return `Error: ${error.message}`;
  }
}
