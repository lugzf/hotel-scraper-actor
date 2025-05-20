import { log, Dataset, PlaywrightCrawler } from 'crawlee';
import fs from 'fs/promises';

// Tenta usar input da Apify (via env var), senão cai no arquivo local
let input;
try {
    input = JSON.parse(process.env.INPUT);
} catch {
    input = JSON.parse(await fs.readFile('./INPUT.json', 'utf-8'));
}

const crawler = new PlaywrightCrawler({
    requestHandlerTimeoutSecs: 60,

    async requestHandler({ page, request }) {
        log.info(`Abrindo página: ${request.url}`);

        await autoScroll(page);
        await page.waitForTimeout(3000);

        const content = await page.content();
        const match = content.match(/(\d+)\s+quartos?/i);
        const hotelSize = match ? match[0] : null;

        await Dataset.pushData({
            url: request.url,
            hotelSize,
        });
    },

    failedRequestHandler({ request }) {
        log.error(`Falha ao acessar ${request.url}`);
    }
});

await crawler.run(input.startUrls);

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
