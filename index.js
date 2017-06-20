var express = require('express');
var bodyParser = require('body-parser');
var mu = require('mu2');
var pdf = require('html-pdf');
var fs = require('fs');
var _ = require('lodash');
var templateDir = './template/';
var app = express();
app.use(bodyParser.json());

const config = {
    path:{
        css: {
            color: templateDir + 'template.css',
            bw: templateDir + 'templateblackwhite.css'
        }
    },
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

let handleProfileRequest = (req, res, justRenderHTML) => {
    let student = req.body;
    student.css = fs.readFileSync(student.printerFriendly ? config.path.css.bw : config.path.css.color, 'utf-8');

    student.softSkills = _.filter(student.skillSet, {type: '0'});
    student.hardSkills = _.filter(student.skillSet, {type: '1'});
    student.spokenLanguages = extractLanguagesByLanguageName(student.spokenLanguages);
    student.github = createSocialNetworkObject('GITHUB', student.socialNetworks);
    student.linkedin = createSocialNetworkObject('LINKEDIN', student.socialNetworks);
    student.educations = _.reverse(_.sortBy(student.educations, ['started']));
    student.workExperiences = _.reverse(_.sortBy(student.workExperiences, ['started']));
    student.prettifiedBirthday = prettifyBirthday(student.personalInfo.birthDate);
    student.firstnameLongname = injectCSSClass(student.personalInfo.firstName, student.personalInfo.lastName);

    let html = "";
    let emitter = mu.compileAndRender(templateDir + 'template.html', student);

    emitter.on('data', (data) => {
        html += data.toString();
    });

    emitter.on('end', () => {
        if (justRenderHTML === true) {
            res.send(html);
        } else {
            pdf.create(html).toBuffer((err, buffer) => {
                res.send(buffer);
            });
        }
    });
};

app.post('/', handleProfileRequest);

app.get('/', function (req, res) {
    req.body = JSON.parse(fs.readFileSync('sample/sample-student-1.json'));
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
let extractLanguagesByLanguageName = (languages) => {
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
 * Generates an object based on a social network name and a given array:
 * input strs: 'GITHUB' || 'LINKEDIN'
 * @param networkName
 * @param socialNetworks
 * @returns {Object}
 */
let createSocialNetworkObject = (networkName, socialNetworks) => {
    let missingNetwork = {
        name: 'N/A',
        url: '#'
    };
    return _.find(socialNetworks, {title: networkName}) || missingNetwork;
};


const monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/**
 * Generates a prettified birthday string:
 * Example: YYYY-MM-DD -> DD MONTH YYYY
 * @param birthday
 * @returns {String}
 */
let prettifyBirthday = (birthday) => {
    let chunks = birthday.split('-');
    let day = chunks[2];
    let month = monthList[parseInt(chunks[1]) - 1];
    let year = chunks[0];

    return `${day} ${month} ${year}`;
};


app.listen(8080);