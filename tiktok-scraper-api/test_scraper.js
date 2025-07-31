const { scrapeFirstProductFromCategory } = require('./src/scraper/productScraper');
const TEST_CATEGORY_URL = 'https://www.tiktok.com/shop/c/eyewear/905352';

async function main() {
    try {
        console.log('--- MEMULAI PENGUJIAN SCRAPER (STRATEGI BARU) ---');
        const productData = await scrapeFirstProductFromCategory(TEST_CATEGORY_URL);
        
        console.log('--- HASIL SCRAPING SUKSES ---');
        console.log('Judul Produk:', productData?.data?.product?.title);
        console.log('Nama Toko:', productData?.data?.seller?.name);
        console.log('---------------------------------');
    } catch (error) {
        console.error('--- PENGUJIAN GAGAL ---');
        console.error('Error:', error.message);
        console.log('-------------------------');
    }
}

main();