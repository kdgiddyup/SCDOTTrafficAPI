const puppeteer = require("puppeteer");
// https://www.npmjs.com/package/puppeteer

const stationPage = "https://scdottrafficdata.drakewell.com/sitemonitor.asp?node=SCDOT_CCS&cosit=00000000";

module.exports = function(app) {

    // get request to retrieve site table rows
    // todo: parse and format row data before returning to front-end
    app.get("/api/tables/:id", async function(req, res) {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let date = now.getDate();
        
        try {
            await page.goto(`${stationPage}${req.params.id}&reportdate=${year}-${month < 10 ? `0${month + 1}` : month + 1}-${date < 10 ? `0${date}` : date}`)
        // navigate to requested page
        }
        catch(err){
            console.log(err); 
            res.set("Access-Control-Allow-Origin","*").send(err);
        }

        try {
            let data;
            await page.evaluate( ()=>{
                let table = document.getElementById("tableContainer").getElementsByTagName("table")[0];
                let rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
                data = { 
                    actualDir1:[],
                    histDir1:[],
                    speedDir1:[],
                    actualDir2:[],
                    histDir2:[],
                    speedDir2:[],
                    dirNames: [table.getElementsByTagName("th")[1].textContent, table.getElementsByTagName("th")[2].textContent]
                }
                for (let i=0; i<rows.length; i++){
                    data.actualDir1.push(row[i].getElementsByTagName("td")[1]);
                    data.histDir1.push(row[i].getElementsByTagName("td")[2]);
                    data.speedDir1.push(row[i].getElementsByTagName("td")[3]);
                    data.actualDir2.push(row[i].getElementsByTagName("td")[5]);
                    data.histDir2.push(row[i].getElementsByTagName("td")[6]);
                    data.speedDir2.push(row[i].getElementsByTagName("td")[7]);
                }
                
            });
            console.log(data)
            await browser.close();
            // clean up

            res.status(200).set("Access-Control-Allow-Origin","*").json( data );
        }
        catch(err) {
            console.log(err); 
            res.set("Access-Control-Allow-Origin","*").send(err);
        };
    });
};