import { PlaywrightCrawler, log, Dataset } from 'crawlee';

const input = await JSON.parse(process.env.INPUT || '{"startUrls": []}');

const crawler = new PlaywrightCrawler({
    requestHandlerTimeoutSecs: 60,
    maxConcurrency: 1, // Evita acessos simultâneos
    minConcurrency: 1,
    maxRequestRetries: 3,
    retryOnBlocked: true,
    retryOnNetworkError: true,

    preNavigationHooks: [
        async () => {
            const delay = Math.floor(Math.random() * 5000) + 3000; // 3 a 8 segundos
            log.info(`Aguardando ${delay}ms antes da navegação para evitar bloqueio...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    ],

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
