import { PlaywrightCrawler, log, Dataset } from 'crawlee';

// Fallback se INPUT não for passado corretamente
const input = await JSON.parse(process.env.INPUT || '{"startUrls": []}');

// Configuração do crawler
const crawler = new PlaywrightCrawler({
    requestHandlerTimeoutSecs: 60,
    maxConcurrency: 1,         // reduz carga no servidor
    minConcurrency: 1,
    maxRequestRetries: 3,
    retryOnBlocked: true,      // reenvia requisições com erro 429

    // Delay antes da navegação para evitar bloqueios por frequência
    preNavigationHooks: [
        async () => {
            const delay = Math.floor(Math.random() * 5000) + 3000; // 3s a 8s
            log.info(`Aguardando ${delay}ms antes de continuar...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    ],

    // Tratamento das requisições bem-sucedidas
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

    // Tratamento de falhas definitivas
    failedRequestHandler({ request }) {
        log.error(`Falha ao acessar ${request.url}`);
    }
});

// Executa com URLs de entrada
await crawler.run(input.startUrls);

// Função de scroll automático
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
