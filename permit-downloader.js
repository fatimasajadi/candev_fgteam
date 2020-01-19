var scraperjs = require("scraperjs");
var request = require("request");
var fs = require("fs");

var series = require("async/series");

const baseUrl = "https://apps.cer-rec.gc.ca";

scraperjs.StaticScraper.create()
    .request({
        uri: `${baseUrl}/REGDOCS/Search/SearchResult?filter=Attr_12629_16&dt=62&sr=1`,
        secureProtocol: "TLSv1_method",
        headers: {
            Cookie: "RDI-NumberOfRecords=500"
        }
    })
    .scrape(function($) {
        return $("#details-elements > table details summary a")
            .map(function() {
                console.log($(this).attr("href"));
                return baseUrl + $(this).attr("href");
            })
            .get();
    })
    .then(function(urls) {
        series(
            urls.map(url => cb => {
                const filePath = `${__dirname}/pdfs/${url.match(/(\d+)$/)[1]}.pdf`;
                let file = fs.createWriteStream(filePath);

                request(url, {
                        secureProtocol: "TLSv1_method"
                    })
                    .pipe(file)
                    .on("finish", () => {
                        console.log('DONE: ', filePath);
                        cb();
                    });
            })
        );
    });

String.prototype.clean = function(str) {
    return this.replace(/\n/g, "").trim();
};