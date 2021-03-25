// get html from URLs
var request = require("request-promise");

// Scrapes our HTML
var cheerio = require("cheerio");
var axios = require("axios");

// this will change depending on environment
var stationPage = "http://dbw.scdot.org/Poll5WebAppPublic/wfrm/wfrmViewDataNightly.aspx?DisTbl=T&Site=";

module.exports = function(app) {

    // get request to retrieve site table rows
    // todo: parse and format row data before returning to front-end
    app.get("/api/tables/:id", function(req, res) {
        var options = {
            uri: `${stationPage}${req.params.id}`,
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
            data.dirNames[0] = $(".tableHead").children("th").eq(1).html();
            data.dirNames[1] = $(".tableHead").children("th").eq(2).html();

            // push rows of class .rowWhiteDisplay and .rowNormalDisplay into data array
            $(".rowWhiteDisplay,.rowNormalDisplay").each( (rowIndex,row) => {
                data.actualDir1[rowIndex] = $(row).children("td").eq(1).html();
                data.histDir1[rowIndex] = $(row).children("td").eq(2).html();
                data.speedDir1[rowIndex] = $(row).children("td").eq(3).html();
                data.actualDir2[rowIndex] = $(row).children("td").eq(4).html();
                data.histDir2[rowIndex] = $(row).children("td").eq(5).html();
                data.speedDir2[rowIndex] = $(row).children("td").eq(6).html();
            });
            
            res.status(200).set("Access-Control-Allow-Origin","*").json( data );
        })
        .catch(function (err) {
            console.log(err); 
            res.set("Access-Control-Allow-Origin","*").send(err);
        });
    });
};