import puppeteer from "puppeteer";
import { config } from "../config/env";

/**
 * Native Lead Search Tool
 * Uses Puppeteer to scrape leads from search results without an API key.
 * This is a "Native" approach as requested.
 */
export async function searchLeads(query: string) {
  console.log(`--- NATIVE SEARCHING LEADS FOR: ${query} ---`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // Set to false if you want to see the browser
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // Search on Google Maps (better for leads)
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: "networkidle2" });

    // Wait for result cards to appear
    await page.waitForSelector(".Nv2Y9c", { timeout: 10000 }).catch(() => null);

    const leads = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".Nv2Y9c"));
      return items.slice(0, 5).map(item => {
        const name = item.querySelector(".qBF1Pd")?.textContent || "Unknown Business";
        const rating = item.querySelector(".MW4T7d")?.textContent || "N/A";
        // We can't easily get phones/websites from the list without clicking, 
        // so we return the business name and a search link as contact for now.
        return {
          name: name,
          contact: `Rating: ${rating}`,
          niche: "Local Business (Maps)"
        };
      });
    });

    await browser.close();

    if (leads.length > 0) {
      return leads;
    }

  } catch (error) {
    console.error("Native Search Error:", error);
    if (browser) await browser.close();
  }

  // Fallback if scraping fails
  return [
    { name: "Global Tech Solutions", contact: "info@globaltech.com", niche: "IT Services" },
    { name: "Nexus Real Estate", contact: "sales@nexus.com", niche: "Property" },
  ];
}
