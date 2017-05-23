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
    console.log("Elotte ", student.spokenLanguages);
    student.spokenLanguages = extractLanguagesByLanguageName(student.spokenLanguages);
	console.log("Utana ", student.spokenLanguages);

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

var extractLanguagesByLanguageName = function (language) {
	var result = [];
	for (var i = 0; i < language.length; i++) {
        if (language[i].level !== 'NATIVE') {
            // console.log(">>", language[i].languageName);
            // console.log(">>", language[i].level);
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

/**
 * Extract GitHub URL by key from the socialnetwork data.
 * @param socialNetworks
 * @returns '#' - to act as href value or the url itself.
 */
var extractGitHubUrl = function (socialNetworks) {
	var result = "#";
	if(socialNetworks === undefined){
		return result;
	}
	for (var i = 0; i < socialNetworks.length; i++) {
		if (socialNetworks[i].title === "GITHUB") {
			result = socialNetworks[i].url;
		}
	}
	return result;
};

/**
 * Extract LinkedIn URL by key from the socialnetwork data.
 * @param socialNetworks
 * @returns '#' - to act as href value or the url itself.
 */
var extractLinkedInUrl = function (socialNetworks) {
	var result = "#";
	if(socialNetworks === undefined){
		return result;
	}
	for (var i = 0; i < socialNetworks.length; i++) {
		if (socialNetworks[i].title === "LINKEDIN") {
			result = socialNetworks[i].url;
		}
	}
	return result;
};

/**
 * Extract the short part (after the / ) from a GitHub link.
 * @param url
 * @returns {*}
 */
var extractGitHubShort = function (url) {
	var chopped = url.split("/");
	if (chopped[chopped.length - 1] === "") {
		return result = chopped[chopped.length - 2];
	}
	return result = chopped[chopped.length - 1];
};

/**
 * Creates GitHub content holder object, or returns undefined
 * if no GitHub url was provided. Needed to be able to hide the
 * section with Mustache if missing.
 * @param student
 * @returns {*}
 */
var createGitHubDataObject = function(student){
	var url = extractGitHubUrl(student.socialNetworks);
	if(url && url !== '#'){
		return {
			url: url,
			short: extractGitHubShort(url)
		};
	}
	return undefined;
};

/**
 * Creates LinkedIn content holder object, or returns undefined
 * if no LinkedIn url was provided. Needed to be able to hide the
 * section with Mustache if missing.
 * @param student
 * @returns {*}
 */
var createLinkedInDataObject = function(student){
	var url = extractLinkedInUrl(student.socialNetworks);
	if(url && url !== '#'){
		return {
			url: url,
			name: student.personalInfo.firstName + ' ' + student.personalInfo.lastName
		};
	}
	return undefined;
};

app.listen(8080);
