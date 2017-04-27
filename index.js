var express = require('express');
var bodyParser = require('body-parser');
var mu = require('mu2');
var pdf = require('html-pdf');
var fs = require('fs');
var templateDir = './template/';
var css = fs.readFileSync(templateDir + 'template.css', 'utf-8');

var app = express();
app.use(bodyParser.json());

// needed for CORS requests.
// if the requesting party has defined settings, use those,
// otherwise allow all
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
	res.header('Access-Control-Expose-Headers', 'Content-Length');
	res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	} else {
		return next();
	}
});

app.post('/', function(req, res) {
	var student = req.body;
	student.css = css;

	student.hardSkills = extractSkillsByType('HARD', student.skillSet);
    student.softSkills = extractSkillsByType('SOFT', student.skillSet);
	
	student.gitHubUrl = extractGitHubUrl(student.socialNetworks);
	student.gitHubShort = extractGitHubShort(student.socialNetworks);

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
    if(skills === undefined){
    	return result;
	}
    for (var i = 0; i < skills.length; i++) {
        if (skills[i].type === type) {
            result.push(skills[i]);
        }
    }
    return result;
};

var extractGitHubUrl = function (socialNetworks) {
	var result = "";
	for (var i = 0; i < socialNetworks.length; i++) {
		if (socialNetworks[i].title == "GITHUB") {
			result = socialNetworks[i].url;
		} else {
			result = "#";
		}
	}
	return result;
}

var extractGitHubShort = function (socialNetworks) {
	var result = "";
	for (var i = 0; i < socialNetworks.length; i++) {
		if (socialNetworks[i].title == "GITHUB") {
			var url = socialNetworks[i].url;
			console.log("-----> ", url);
			var chopped = url.split("/");
			if (chopped[chopped.length - 1] == "") {
				result = chopped[chopped.length - 2];
			} else {
				result = chopped[chopped.length - 1];
			}
		}
	}
	return result;
}

app.listen(8080);