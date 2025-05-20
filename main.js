import { PlaywrightCrawler, Dataset } from 'crawlee';
import { setTimeout } from 'timers/promises';

const startUrls = [
    { url: 'https://www.expedia.com/Macapa-Hotels-AMAPA-HOTEL.h34629558.Hotel-Information?' },
    // Adicione outras URLs se desejar
];

function randomDelay(min = 1500, max = 4000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const crawler = new PlaywrightCrawler({
    async requestHandler({ request, page, log }) {
        log.info(`Abrindo página: ${request.url}`);

        // Scroll gradual para comportamento humano
        await page.mouse.wheel(0, 200);
        await setTimeout(randomDelay(800, 1600));
        await page.mouse.wheel(0, 400);
        await setTimeout(randomDelay(1000, 2000));
        await page.mouse.wheel(0, 800);
        await setTimeout(randomDelay(1500, 2500));

        // Espera até a seção com o texto "Destaques" aparecer
        await page.locator('text=Destaques').scrollIntoViewIfNeeded();
        await setTimeout(randomDelay(1000, 2000));

        // Extrai o texto com número de quartos
        const hotelSize = await page.locator('text=Tamanho do hotel').locator('..').locator('text=/\\d+ quartos?/').textContent();

        await Dataset.pushData({
            url: request.url,
            hotelSize,
        });

        await setTimeout(randomDelay());
    },
});

await crawler.run(startUrls);
