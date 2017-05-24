var express = require('express');
var bodyParser = require('body-parser');
var mu = require('mu2');
var pdf = require('html-pdf');
var fs = require('fs');
var templateDir = './template/';
var css_color = fs.readFileSync(templateDir + 'template.css', 'utf-8');
var css_bw = fs.readFileSync(templateDir + 'templateblackwhite.css', 'utf-8');
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
	if (student.printerFriendly) {
        student.css = css_bw;
	}
    student.softSkills = extractSkillsByType('0', student.skillSet);
    student.hardSkills = extractSkillsByType('1', student.skillSet);
    student.spokenLanguages = extractLanguagesByLanguageName(student.spokenLanguages);
	student.github = createSocialNetworkObject('GITHUB', student.socialNetworks);
	student.linkedin = createSocialNetworkObject('LINKEDIN', student.socialNetworks);
	student.educations.sort(compare);
	student.workExperiences.sort(compare);
	student.prettifiedBirthday = prettifyBirthday(student.personalInfo.birthDate);

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


/**
 * Generates an object based on a social network name and a given array:
 * input strs: 'GITHUB' || 'LINKEDIN'
 * @param networkName
 * @param socialNetworks
 * @returns {Object}
 */
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
    return result;
};


/**
 * Generates a prettified birthday string:
 * Example: YYYY-MM-DD -> DD MONTH YYYY
 * @param birthday
 * @returns {String}
 */
var prettifyBirthday = function (birthday) {
	var chunks = birthday.split('-');
	var year = parseInt(chunks[0]);
	var month = parseInt(chunks[1]);
	var day = parseInt(chunks[2]);
	if (month === 1) {
		month = 'January'
	} else if (month === 2) {
        month = 'February'
	} else if (month === 3) {
        month = 'March'
    } else if (month === 4) {
        month = 'April'
    } else if (month === 5) {
        month = 'May'
    } else if (month === 6) {
        month = 'June'
    } else if (month === 7) {
        month = 'July'
    } else if (month === 8) {
        month = 'August'
    } else if (month === 9) {
        month = 'September'
    } else if (month === 10) {
        month = 'October'
    } else if (month === 11) {
        month = 'November'
    } else if (month === 12) {
        month = 'December'
    }
	return day + ' ' + month + ' ' + year;
};


var compare = function (a, b) {
    if (a.started > b.started)
        return -1;
    if (a.started < b.started)
        return 1;
    return 0;
};


app.listen(8080);