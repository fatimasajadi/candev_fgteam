var scraperjs = require("scraperjs");
const baseUrl = "https://apps.cer-rec.gc.ca";
const dateRegex = /(\d{4}\/\d{2}\/\d{2}, \d+:\d+ [AP]M [A-Z]{3})/m;

scraperjs.StaticScraper.create()
  .request({
    uri: `${baseUrl}/REGDOCS/Search/SearchResult?filter=Attr_12629_16&dt=66&sr=1`,
    secureProtocol: "TLSv1_method",
    headers: {
        'Cookie': 'RDI-NumberOfRecords=10'
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
    urls.slice(0, 1).forEach(uri => {
      scraperjs.StaticScraper.create()
        .request({
          uri,
          secureProtocol: "TLSv1_method",
          followAllRedirects: true
        })
        .scrape(function($) {
          const bodyText = $("body").text();
          const roleMatches = bodyText.match(/Rôle:[\s\r\n]*(\w+)/m);
          const projectMatches = bodyText.match(/Projet\s?:[\s\r\n]*(.+)$/m);
          const idMatches = bodyText.match(/Id du dépôt\s?:[\s\r\n]*(.+)$/m);
          console.log(bodyText)
          console.log(idMatches[1])

          const a = $(
            "body > table:nth-child(1) > tr:nth-child(4) > td:nth-child(2)"
          ).text();
          const id = $(
            "body > table:nth-child(1) > tr:nth-child(4) > td:nth-child(1) > b"
          )
            .text()
            .match(/([A-Z]\d+)/);
          const dateMatches = a.match(dateRegex);
          const name = $(
            "body > table:nth-child(1) > tr:nth-child(8) > td:nth-child(1)"
          )
            .text()
            .clean();
          const role = roleMatches && roleMatches[1].clean();
          const postalCode = $(
            "body > table:nth-child(1) > tr:nth-child(11) > td:nth-child(2)"
          )
            .text()
            .clean();

          console.log(
            [
              urls.indexOf(uri),
              uri,
              id && id[1],
              name,
              role,
              dateMatches && dateMatches[1],
              postalCode
            ].join(",")
          );
        });
    });
  });

String.prototype.clean = function(str) {
  return this.replace(/\n/g, "").trim();
};
