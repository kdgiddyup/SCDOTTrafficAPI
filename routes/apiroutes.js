const puppeteer = require("puppeteer");
// https://www.npmjs.com/package/puppeteer

const stationPage = "https://scdottrafficdata.drakewell.com/sitemonitor.asp?node=SCDOT_CCS&cosit=00000000";

module.exports = function (app) {

    // get request to retrieve site table rows
    // todo: parse and format row data before returning to front-end
    app.get("/api/tables/:id", async function (req, res) {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let date = now.getDate();

        try {
            await page.goto(`${stationPage}${req.params.id}&reportdate=${year}-${month < 10 ? `0${month + 1}` : month + 1}-${date < 10 ? `0${date}` : date}`);
            // navigate to requested page

            try {
                const data = await page.evaluate(() => {
                    const _data = {
                        actualDir1: [],
                        histDir1: [],
                        speedDir1: [],
                        actualDir2: [],
                        histDir2: [],
                        speedDir2: []
                    };
                    const headRows = document.querySelectorAll("#tableContainer thead th");
                    return headRows;
                    console.log(headRows);
                    const bodyRows = document.querySelectorAll("#tableContainer tbody tr");
                    console.log(bodyRows)

                    _data.dirNames = [headRows[1].textContent, headRows[2].textContent];

                    for (let i = 0; i < bodyRows.length; i++) {
                        let cells = bodyRows[i].getElementsByTagName("td");
                        _data.actualDir1.push(cells[1].textContent);
                        _data.histDir1.push(cells[2].textContent);
                        _data.speedDir1.push(cells[3].textContent);
                        _data.actualDir2.push(cells[5].textContent);
                        _data.histDir2.push(cells[6].textContent);
                        _data.speedDir2.push(cells[7].textContent);
                    }

                    console.log(_data)
                    return _data;
                });
                await browser.close();
                // clean up
                res.status(200).set("Access-Control-Allow-Origin", "*").json(data);
            }
            catch (err) {
                console.log(err);
                await browser.close();
                res.set("Access-Control-Allow-Origin", "*").send(err);
            };
        }
        catch (err) {
            console.log(err);
            await browser.close();
            res.set("Access-Control-Allow-Origin", "*").send(err);
        }
    });
};