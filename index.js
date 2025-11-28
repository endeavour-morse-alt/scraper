const fs = require('fs');
const puppeteer = require('puppeteer');

console.log("It's working, finally");

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser' // المسار لـ Chromium اللي ثبّتته
    });
    const page = await browser.newPage();

    await page.goto('https://daleel.admission.gov.sd/result2024/Result_2024.aspx', { waitUntil: 'networkidle2' });

    let results = [];

    for (let num = 11011000; num <= 11020000; num++) {
        // اكتب الرقم في الحقل
        await page.type('#TextBox1', num.toString());

        // اضغط وانتظر إعادة تحميل الصفحة
        await Promise.all([
            page.click('#Button1'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);

        try {
            // جرّب استخراج النتيجة مباشرة
            const name = await page.$eval('#GridView1 tr:nth-child(2) td:nth-child(1)', el => el.textContent.trim());
            const college = await page.$eval('#GridView1 tr:nth-child(2) td:nth-child(2)', el => el.textContent.trim());

            // نضيف الرقم إلى النصوص
            const nameWithNumber = `${num} - ${name}`;
            const collegeWithNumber = `${num} - ${college}`;

            results.push({ number: num, name: nameWithNumber, college: collegeWithNumber });
            console.log(`Number: ${num}, Name: ${nameWithNumber}, College: ${collegeWithNumber}`);
        } catch (err) {
            // لو مفيش نتيجة
            results.push({ number: num, name: "doesn't exist", college: "doesn't exist" });
            console.log(`Number: ${num} doesn't exist`);
        }

        // مسح الحقل قبل الرقم التالي
        await page.evaluate(() => {
            document.querySelector('#TextBox1').value = '';
        });
    }

    // حفظ النتائج في ملف JSON
    fs.writeFileSync('results11.json', JSON.stringify(results, null, 2));
    await browser.close();
})();
