import puppeteer from "puppeteer";

/**
 * SEO Audit Tool
 * Scrapes a website to analyze meta tags, headers, and images.
 */
export async function seoAudit(url: string) {
  console.log(`--- RUNNING SEO AUDIT FOR: ${url} ---`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const auditResults = await page.evaluate(() => {
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || "Missing";
      const h1Tags = Array.from(document.querySelectorAll('h1')).map(h => h.innerText);
      const imagesWithoutAlt = Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length;
      
      return {
        title,
        description,
        h1Count: h1Tags.length,
        h1First: h1Tags[0] || "None",
        missingAltImages: imagesWithoutAlt,
        url: window.location.href
      };
    });

    await browser.close();
    return auditResults;

  } catch (error) {
    console.error("SEO Audit Error:", error);
    if (browser) await browser.close();
    return { error: "Could not analyze website. Please check the URL." };
  }
}
