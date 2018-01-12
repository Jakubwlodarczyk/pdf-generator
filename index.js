let express = require('express'),
    bodyParser = require('body-parser'),
    mu = require('mu2'),
    pdf = require('html-pdf'),
    app = express();

app.use(bodyParser.json());

let compileTemplate = (req, res) => {
    let template = req.body.template;
    let context = req.body.context;
    let compiledTemplate = "";

    let emitter = mu.renderText(template, context);

    let options = {
        'format' : 'A4',
        "border": {
            "top": "0.75in",
            "left": "0.5in",
            "right": "0.5in",
            "bottom": "0.75in"
        },
    };

    emitter.on('data', (data) => {
        compiledTemplate += data.toString();
    });

    emitter.on('end', () => {
        pdf.create(compiledTemplate, options).toBuffer((err, buffer) => {
            res.send(buffer);
        })
    });

};

app.post('/', compileTemplate);

app.listen(8080);
