import { PlaywrightCrawler, Actor } from 'crawlee';

await Actor.init();

const input = await Actor.getInput() || { startUrls: [] };

const crawler = new PlaywrightCrawler({
    requestHandlerTimeoutSecs: 60,

    async requestHandler({ page, request, log, pushData }) {
        log.info(`Abrindo página: ${request.url}`);
        await autoScroll(page);
        await page.waitForTimeout(3000);
        const content = await page.content();
        const match = content.match(/(\d+)\s+quartos?/i);
        const hotelSize = match ? match[0] : null;
        await pushData({
            url: request.url,
            hotelSize,
        });
    },

    failedRequestHandler({ request, log }) {
        log.error(`Falha ao acessar ${request.url}`);
    }
});

await crawler.run(input.startUrls);
await Actor.exit();

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
