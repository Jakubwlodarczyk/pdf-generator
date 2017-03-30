var express = require('express');
var bodyParser = require('body-parser');
var mu = require('mu2');
var pdf = require('html-pdf');
var fs = require('fs');
var templateDir = './template/';
var css = fs.readFileSync(templateDir + 'template.css', 'utf-8');

var app = express();
app.use(bodyParser.json());

app.post('/', function(req, res) {
	var student = req.body;
	student.css = css;
    student.hardSkills = extractSkillsByType('HARD', student.skillSet);
    student.softSkills = extractSkillsByType('SOFT', student.skillSet);
	var html = "";
	var emitter = mu.compileAndRender(templateDir + 'template.html', student);
	
	emitter.on('data', function(data) {
    	html += data.toString();
	});

	emitter.on('end', function () {
	    pdf.create(html).toBuffer(function(err, buffer) {
			res.send(buffer);
    	});	
	});
});

var extractSkillsByType = function (type, skills) {
    var result = [];
    for (i = 0; i < skills.length; i++) {
        if (skills[i].type == type) {
            result.push(skills[i]);
        }
    }
    return result;
}

app.listen(8080);