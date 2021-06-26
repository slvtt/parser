const fs = require('fs');
const puppeteer = require('puppeteer');

let link = 'https://www.dns-shop.ru/catalog/17a8a01d16404e77/smartfony/?p=';

(async (filename, listener) => {

    let flag = true;
    let res = [];
    let counter = 1;

    try {
        let browser = await puppeteer.launch({
            headless:false,
            slowMo:100,
            devtools:true
        })

        let page = await browser.newPage();

        await page.setViewport({
            width:1400,
            height:900
        })

        while (flag) {
            await page.goto(`${link}${counter}`)
            await page.waitForSelector('a.pagination-widget__page-link_next')
            console.log(counter)

            let html = await page.evaluate(async () => {
                let page = [];

                try {
                    let divs = document.querySelectorAll('.catalog-product')

                    divs.forEach(div => {
                        let a = div.querySelector('.ui-link');

                        let obj = {
                            title:div.querySelector('.ui-link span') !== null
                                ? div.querySelector('.ui-link span').innerText
                                : 'no-title',
                            link:a.href,
                            price:div.querySelector('.product-buy__price') !== null
                                ? div.querySelector('.product-buy__price').innerText
                                :'no-price'
                        };

                        page.push(obj);

                    })
                    console.log(divs)
                } catch (e) {
                    console.log(e)
                }

                return page;

            },{waitUntil:'a.pagination-widget__page-link_next'});

            await res.push(html);

            for (let i in res){
                if (res[i].length === 0) {
                    flag = false;
                }
            }

            res = res.flat(1)

            counter++;

        }

        await browser.close();

        fs.writeFile('dns.json', JSON.stringify({"data": res}), err => {
            if (err) throw err

            console.log('dns.json saved');
            console.log('dns.json length = ', res.length);
        })

    } catch (e){
        console.log(e);
    }
})()