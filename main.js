import { PlaywrightCrawler, Dataset } from 'crawlee';

const startUrls = [
    { url: 'https://www.expedia.com/Macapa-Hotels-AMAPA-HOTEL.h34629558.Hotel-Information?' },
    { url: 'https://www.expedia.com/Macapa-Hotels-Hotel-Do-Forte.h10412384.Hotel-Information?' },
    { url: 'https://www.expedia.com/Macapa-Hotels-Forte-Express.h38761841.Hotel-Information?' },
    { url: 'https://www.expedia.com/Macapa-Hotels-Royal-Hotel-Gastronomia.h36456999.Hotel-Information?' },
    { url: 'https://www.expedia.com/Macapa-Hotels-Frota-Palace-Hotel.h12670744.Hotel-Information?' },
    { url: 'https://www.expedia.com/Macapa-Hotels-B-E-B.h108814946.Hotel-Information?' },
    { url: 'https://www.expedia.com/Macapa-Hotels-Hotel-Macapaba.h44232128.Hotel-Information?' },
    { url: 'https://www.expedia.com/Macapa-Hotels-Hotel-Xenios.h36456857.Hotel-Information?' },
];

const crawler = new PlaywrightCrawler({
    async requestHandler({ request, page, log }) {
        log.info(`Abrindo página: ${request.url}`);

        const title = await page.title();
        const hotelName = await page.locator('h1').first().textContent();
        const address = await page.locator('[data-stid="content-hotel-address"]').first().textContent();
        const rating = await page.locator('[data-stid="content-hotel-reviews-rating"]').first().textContent();

        await Dataset.pushData({
            url: request.url,
            title,
            hotelName,
            address,
            rating,
        });
    },
});

await crawler.run(startUrls);
