import playwright from 'playwright';

const IMAGE_PATH = 'C:\\Users\\ELHEGAWY 7\\Desktop\\my-next-app\\gemini_post.jpg';
const POST_TEXT = `🚀 اكتشف الجيل الجديد من التجارة الإلكترونية الذكية مع Hegawy Stores!

نقدم لكم Opus 4.8 - أحدث إصدار من نظامنا لإدارة المتاجر الإلكترونية المدعومة بالذكاء الاصطناعي.

✨ مميزات المتجر الذكي:
• تصميم متجاوب يعمل على جميع الأجهزة
• وكلاء ذكاء اصطناعي لأتمتة المبيعات وخدمة العملاء
• أنظمة دفع وشحن متكاملة
• لوحة تحكم متقدمة لإدارة المخزون والطلبات
• تقارير وتحليلات ذكية لأداء مبيعاتك

🏪 أطلق متجرك الإلكتروني الآن وانطلق إلى آفاق جديدة من النجاح!

📩 تواصل معنا عبر الرسائل لبدء مشوارك الرقمي`;

async function main() {
  const browser = await playwright.chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();
  
  await page.goto('https://business.facebook.com/latest/composer/?business_id=991569727190881&asset_id=1077200972154010', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  
  const currentUrl = page.url();
  if (currentUrl.includes('login') || currentUrl.includes('checkpoint')) {
    console.log('Please log in to Facebook in the opened browser window.');
    console.log('Waiting up to 120 seconds for login...');
    await page.waitForURL('**/composer/**', { timeout: 120000 });
  }
  
  await page.waitForTimeout(3000);
  
  const addPhotoButton = page.getByRole('button', { name: 'Add photo/video' });
  await addPhotoButton.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Found Add photo/video button');
  
  const fileInput = page.locator('input[type="file"]');
  if (await fileInput.count() > 0) {
    console.log('Using file input directly');
    await fileInput.setInputFiles(IMAGE_PATH);
  } else {
    console.log('Clicking Add photo/video button');
    await addPhotoButton.click();
    const fileChooser = await page.waitForEvent('filechooser', { timeout: 10000 });
    console.log('Setting file');
    await fileChooser.setFiles(IMAGE_PATH);
  }
  
  await page.waitForTimeout(2000);
  console.log('Image uploaded');
  
  const textBox = page.getByRole('combobox', { name: /write|text|post|dialogue/i });
  await textBox.waitFor({ state: 'visible', timeout: 10000 });
  await textBox.click();
  await textBox.fill(POST_TEXT);
  console.log('Text entered');
  
  await page.waitForTimeout(1000);
  
  const publishButton = page.getByRole('button', { name: /^Publish$/ });
  await publishButton.waitFor({ state: 'visible', timeout: 10000 });
  await publishButton.click();
  console.log('Publish clicked!');
  
  await page.waitForTimeout(5000);
  
  console.log('Post published successfully!');
  
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
