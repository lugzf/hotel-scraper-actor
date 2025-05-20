import { PlaywrightCrawler, log, Dataset } from 'crawlee';

// Lê os dados de entrada fornecidos na interface ou via API
const input = JSON.parse(process.env.INPUT || '{"startUrls": []}');

const crawler = new PlaywrightCrawler({
    // Limita para evitar bloqueios por excesso de requisições simultâneas
    minConcurrency: 1,
    maxConcurrency: 1,
    requestHandlerTimeoutSecs: 60,

    async requestHandler({ page, request }) {
        log.info(`Abrindo página: ${request.url}`);

        // Scroll para carregar elementos lazy-loaded
        await autoScroll(page);

        // Delay aleatório entre 2 e 5 segundos
        await page.waitForTimeout(Math.random() * 3000 + 2000);

        const content = await page.content();

        // Captura padrão de quartos, ex: "23 quartos"
        const match = content.match(/(\d+)\s+quartos?/i);
        const hotelSize = match ? match[0] : null;

        // Salva dados no dataset do Apify
        await Dataset.pushData({
            url: request.url,
            hotelSize,
        });
    },

    failedRequestHandler({ request }) {
        log.error(`Falha ao acessar ${request.url}`);
    }
});

// Inicia o crawler com as URLs fornecidas
await crawler.run(input.startUrls);

// Função para scroll infinito (carregar conteúdos dinamicamente)
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
