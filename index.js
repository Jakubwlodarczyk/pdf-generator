var express = require('express');
var bodyParser = require('body-parser');
var mu = require('mu2');
var pdf = require('html-pdf');
var fs = require('fs');
var _ = require('lodash');
var templateDir = './template/';
var css_color = fs.readFileSync(templateDir + 'template.css', 'utf-8');
var css_bw = fs.readFileSync(templateDir + 'templateblackwhite.css', 'utf-8');
var app = express();
app.use(bodyParser.json());

const config = {
    language: {
        showNative: true,
        levels: {
            BASIC: 'Basic',
            LOW_INTERMEDIATE: 'Lower Intermediate',
            HIGH_INTERMEDIATE: 'Upper Intermediate',
            INTERMEDIATE: 'Intermediate',
            ADVANCED: 'Advanced',
            NATIVE: 'Native'
        },
        codes: {
            ENGLISH: 'gb',
            GERMAN: 'de',
            SPANISH: 'es',
            HUNGARIAN: 'hu',
            POLISH: 'pl',
            FRENCH: 'fr',
            ITALIAN: 'it',
            SLOVAKIAN: 'sk'
        }
    }
};


/** CORS CONFIGURATION */
app.use(function (req, res, next) {

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

var handleProfileRequest = function (req, res, justRenderHTML) {
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
    student.firstnameLongname = injectCSSClass(student.personalInfo.firstName, student.personalInfo.lastName);

    var html = "";
    var emitter = mu.compileAndRender(templateDir + 'template.html', student);

    emitter.on('data', function (data) {
        html += data.toString();
    });

    emitter.on('end', function () {
        if (justRenderHTML === true) {
            res.send(html);
        } else {
            pdf.create(html).toBuffer(function (err, buffer) {
                res.send(buffer);
            });
        }
    });
};

app.post('/', handleProfileRequest);

app.get('/', function (req, res) {
    req.body = JSON.parse(fs.readFileSync('sample/sample-student.json'));
    handleProfileRequest(req, res, true);
});

/**
 * Returns a css class name or an empty str which will be used in the logicless template
 * @param firstName
 * @returns {String}
 */
var injectCSSClass = function (firstName, lastName) {
    var total = (firstName.length + lastName.length);
    console.log("len", total, firstName, lastName);
    return total > 15 ? "firstname-longname" : "";
};

/**
 * Extract languages and generate abbreviations:
 * HARD / SOFT.
 * @param languages
 * @returns {Array}
 */
let extractLanguagesByLanguageName = function (languages) {
    return _.filter(_.map(languages, (language) => {
        if (language.level === 'NATIVE' && !config.language.showNative) {
            return; // skip this
        }

        return {
            languageName: _.capitalize(language.languageName) || '',
            abbreviation: config.language.codes[language.languageName.toUpperCase()],
            level: config.language.levels[language.level] || '',
            active: language.active ? " / Active" : ""
        }
    }), undefined); // Filter skipped undefined language settings
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
    if (socialNetworks === undefined) {
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


const monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/**
 * Generates a prettified birthday string:
 * Example: YYYY-MM-DD -> DD MONTH YYYY
 * @param birthday
 * @returns {String}
 */
let prettifyBirthday = function (birthday) {
    let chunks = birthday.split('-');
    let day = chunks[2];
    let month = monthList[parseInt(chunks[1]) - 1];
    let year = chunks[0];

    return `${day} ${month} ${year}`;
};


var compare = function (a, b) {
    if (a.started > b.started)
        return -1;
    if (a.started < b.started)
        return 1;
    return 0;
};


app.listen(8080);