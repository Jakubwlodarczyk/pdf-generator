var express = require('express');
var bodyParser = require('body-parser');
var mu = require('mu2');
var pdf = require('html-pdf');
var fs = require('fs');
var templateDir = './template/';
var css_color = fs.readFileSync(templateDir + 'template.css', 'utf-8');

var app = express();
app.use(bodyParser.json());

/** CORS CONFIGURATION */
app.use(function(req, res, next) {

	res.header('Access-Control-Allow-Origin', '*');
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
	student.css = css_color;
    student.softSkills = extractSkillsByType('0', student.skillSet);
    student.hardSkills = extractSkillsByType('1', student.skillSet);
    student.spokenLanguages = extractLanguagesByLanguageName(student.spokenLanguages);
	student.github = createSocialNetworkObject('GITHUB', student.socialNetworks);
	student.linkedin = createSocialNetworkObject('LINKEDIN', student.socialNetworks);

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

/**
 * Extract languages and generate abbreviations:
 * HARD / SOFT.
 * @param language
 * @returns {Array}
 */
var extractLanguagesByLanguageName = function (language) {
	var result = [];
	for (var i = 0; i < language.length; i++) {
        if (language[i].level !== 'NATIVE') {
            var element = {languageName: "", abbreviation: ""};
            element.languageName = language[i].languageName.toLowerCase();
            if (language[i].languageName === 'ENGLISH') {
            	element.abbreviation = 'gb';
			} else if (language[i].languageName === 'GERMAN') {
                element.abbreviation = 'de';
            } else if (language[i].languageName === 'SPANISH') {
                element.abbreviation = 'es';
            } else if (language[i].languageName === 'HUNGARIAN') {
                element.abbreviation = 'hu';
            } else if (language[i].languageName === 'POLISH') {
                element.abbreviation = 'pl';
            } else if (language[i].languageName === 'FRENCH') {
                element.abbreviation = 'fr';
            } else if (language[i].languageName === 'ITALIAN') {
                element.abbreviation = 'it';
            } else if (language[i].languageName === 'SLOVAKIAN') {
                element.abbreviation = 'sk';
            }
			result.push(element);
		}
	}
	return result;
};

/**
 * Extract skills from the set, by type:
 * HARD / SOFT.
 * @param type
 * @param skills
 * @returns {Array}
 */
var extractSkillsByType = function (type, skills) {
    var result = [];
    for (var i = 0; i < skills.length; i++) {
        if (skills[i].type === type) {
            result.push(skills[i]);
        }
    }
    return result;
};

var createSocialNetworkObject = function (networkName, socialNetworks) {
    var result = {name: "N/A", url: "#"};
    if(socialNetworks === undefined){
        return result;
    }
    for (var i = 0; i < socialNetworks.length; i++) {
        if (socialNetworks[i].title === networkName) {
            result.name = socialNetworks[i].name;
            result.url = socialNetworks[i].url;
        }
    }
    console.log("mielott visszater ", result);
    return result;
}

app.listen(8080);
