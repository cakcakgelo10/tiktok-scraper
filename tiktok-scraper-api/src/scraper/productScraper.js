// Gunakan playwright-extra untuk fitur tambahan
const { chromium } = require('playwright');

// Tambahkan plugin stealth
// const stealth = require('playwright-extra-plugin-stealth')();
// chromium.use(stealth);

async function scrapeFirstProductFromCategory(categoryUrl) {
    let browser;
    console.log(`[SCRAPER] Memulai scraping dari halaman kategori: ${categoryUrl}`);

    // --- KONFIGURASI PROXY ---
    const proxyConfig = {
    server: 'http://brd-customer-hl_b4e2ef5b-zone-tiktok_scraper:19c4z6clz0tt@brd.superproxy.io:33335'
    };

    try {
        // Jalankan browser dengan konfigurasi proxy
        browser = await chromium.launch({ 
            headless: false, // Biarkan true untuk eksekusi final
            proxy: proxyConfig
        });
        
        const context = await browser.newContext();
        const page = await context.newPage();

        // Target API tetap sama, sebagai fallback jika kita membutuhkannya nanti
        const targetApiUrl = 'https://www.tiktok.com/api/shop/product/pdp_data';

        console.log(`[SCRAPER] Mengunjungi halaman kategori dengan proxy...`);
        // Tunggu sampai jaringan 'idle' untuk memastikan semua skrip sudah dimuat
        await page.goto(categoryUrl, { waitUntil: 'networkidle', timeout: 90000 }); // Timeout lebih lama

        console.log('[SCRAPER] Menunggu container produk untuk dimuat...');
        const productContainerSelector = '#root > div > div > div > div.flex-1.flex.justify-center > div > div > div.background-color-UIPageFlat1.pb-80.\\32 xl\\:px-60.lg\\:px-32.px-20 > div.w-full > div.grid.lg\\:grid-cols-5.md\\:grid-cols-3.grid-cols-2.gap-16';
        await page.waitForSelector(productContainerSelector, { state: 'visible', timeout: 60000 });

        console.log('[SCRAPER] Mencari produk pertama untuk diklik...');
        const firstProductLocator = page.locator('a[href*="/shop/pdp/"]').first();
        await firstProductLocator.waitFor({ state: 'visible', timeout: 30000 });
        
        console.log('[SCRAPER] Mengklik produk pertama...');
        await firstProductLocator.click();
        // Setelah klik, tunggu lagi sampai halaman produk baru selesai memuat
        await page.waitForLoadState('networkidle', { timeout: 60000 });

        console.log('[SCRAPER] Halaman produk telah dimuat. Mencari data JSON yang disematkan...');
        const scriptHandle = await page.locator('script[id^="__MODERN_SSR_DATA__"]').elementHandle();

        if (!scriptHandle) {
            throw new Error('Tidak dapat menemukan script data (__MODERN_SSR_DATA__) di halaman produk.');
        }

        const jsonDataString = await scriptHandle.textContent();
        const fullPageJson = JSON.parse(jsonDataString);
        
        // Asumsi path ini, jika gagal, perlu diinvestigasi lagi di halaman yang berhasil dimuat
        const pdpData = fullPageJson?.props?.pageProps?.pdpData;

        if (!pdpData) {
            console.log(JSON.stringify(fullPageJson, null, 2));
            throw new Error('Tidak dapat menemukan pdpData di dalam JSON halaman. Periksa struktur JSON yang ditampilkan di atas.');
        }
        
        console.log(`[SCRAPER] Scraping berhasil.`);
        return { data: pdpData };

    } catch (error) {
        console.error(`[SCRAPER] Error saat scraping:`, error);
        throw error;
    // } finally {
    //     if (browser) {
    //         console.log(`[SCRAPER] Menutup browser.`);
    //         await browser.close();
    //     }
    }
}

module.exports = {
    scrapeFirstProductFromCategory
};