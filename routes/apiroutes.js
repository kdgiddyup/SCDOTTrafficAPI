// get html from URLs
var request = require("request-promise");

// Scrapes our HTML
var cheerio = require("cheerio");

// this will change depending on environment
var stationPage = "https://scdottrafficdata.drakewell.com/sitemonitor.asp?node=SCDOT_CCS&cosit=00000000";

module.exports = function(app) {

    // get request to retrieve site table rows
    // todo: parse and format row data before returning to front-end
    app.get("/api/tables/:id", function(req, res) {
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let date = now.getDate();
        let idLength = req.params.id.toString().length;
        let options = {
            uri: `${stationPage}${idLength === 1 ? `000${req.params.id}` : idLength === 2 ? `00${req.params.id}` : idLength === 3 ? `0${req.params.id}` : req.params.id}&reportdate=${year}-${month < 10 ? `0${month + 1}` : month + 1}-${date < 10 ? `0${date}` : date}`,
            transform: function (body) {
            return cheerio.load(body);
            }
        };
        request(options).then(function ($) {
            let data ={ 
                actualDir1:[],
                histDir1:[],
                speedDir1:[],
                actualDir2:[],
                histDir2:[],
                speedDir2:[],
                dirNames:[]
            };
            data.dirNames[0] = $("#tableContainer thead th .channel").eq(0).text();
            data.dirNames[1] = $("#tableContainer thead th .channel").eq(1).text()

            // push rows of class .rowWhiteDisplay and .rowNormalDisplay into data array
            $("#tableContainer tbody tr").each( (rowIndex,row) => {
                data.actualDir1[rowIndex] = $(row).children("td").eq(1).html();
                data.histDir1[rowIndex] = $(row).children("td").eq(2).html();
                data.speedDir1[rowIndex] = $(row).children("td").eq(3).html();
                data.actualDir2[rowIndex] = $(row).children("td").eq(5).html();
                data.histDir2[rowIndex] = $(row).children("td").eq(6).html();
                data.speedDir2[rowIndex] = $(row).children("td").eq(7).html();
            });
            
            res.status(200).set("Access-Control-Allow-Origin","*").json( data );
        })
        .catch(function (err) {
            console.log(err); 
            res.set("Access-Control-Allow-Origin","*").send(err);
        });
    });
};