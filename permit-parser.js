const PDFParser = require("pdf2json");
const glob = require("glob-fs")();

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
const monthRegex = `(${months.join("|")})`;
const dateRegex = `[0-9]+ ${monthRegex} [0-9]{4}`;

const endDateRegex = new RegExp(`^BEFORE.* (${dateRegex})`, "m");
const startDateRegex = new RegExp(`^WHEREAS.* (${dateRegex})`, "m");
const companyRegex = /^IN THE MATTER OF .+ by (.+) for\s?(.*)\./m;

var files = glob.readdirSync("pdfs/*.pdf", {});
files.slice(0, 9999999).forEach(file => {
    const pdfParser = new PDFParser(this, 1);

    pdfParser.on("pdfParser_dataError", errData =>
        console.error(errData.parserError)
    );
    pdfParser.on("pdfParser_dataReady", pdfData => {
        const a = pdfParser.getRawTextContent();
        const normalizedText = a.split(/[\r\n]{2}/).reduce((a, b) => {
            // console.log("b", b);
            if (b.trim() === "") {
                return a + "\n";
            }
            return a + (a[a.length - 1] === "\n" ? "" : " ") + b.trim();
        }, "");
        const endDate = normalizedText.match(endDateRegex);
        const startDate = normalizedText.match(startDateRegex);
        const company = normalizedText.match(companyRegex);

        // console.log(a);
        if (!startDate || !endDate) {
            //   console.log("not matched", file);
            return;
        }
        const s = startDate[1];
        const e = endDate[1];
        if (new Date(e).getMilliseconds() < new Date(s).getMilliseconds()) {
            return;
        }
        console.log(
            [
                file,
                s,
                e,
                `"${company && company[1]}"`,
                `"${company && company[2]}"`
            ].join(",")
        );
    });

    pdfParser.loadPDF(file);
});