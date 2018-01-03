# Student Profile CV PDF Generator
A Node.js web-app for generating good-looking PDF Codecooler CVs based on a 'Student' JSON object. This is a subproject of [Student Profile Frontend](https://gitlab.com/codecool/student-profile-frontend).


Take a look at the [sample image here](https://gitlab.com/codecool/student-profile-cv-pdf-generator/blob/cd708c2531971b65260e061ee013c026461a4523/sample/screenshot.png) to get an idea what this tool is about (note: the layout and contents might change over time)


## Project Purpose
This project exists because there is a business need to generate PDF documents based on Codecooler metadata.


## Local Development
- clone the repo
- issue `npm install` to download the dependencies
- take a look at **sample/sample-student.json** - this is a sample JSON that is being compiled into a PDF document
- issue `npm start` to launch the application (it should start listening on port 8080)
- send a **POST** to **localhost:8080** with the payload `curl -X POST http://localhost:8080 -d @sample/sample-student.json --header "Content-Type: application/json" > locally-generated.pdf`

Alternatively:
- you can run `./curl-local.sh` to speed things up

## Dockerizing
The application is intended to run in a Docker container.
- `docker build -t student-profile-cv-pdf-generator-img .`
- `docker run -d -p 7777:8080 --name student-profile-cv-pdf-generator-container student-profile-cv-pdf-generator-img`
- send a **POST** to **localhost:7777** with the payload `curl -X POST http://localhost:7777 -d @sample/sample-student.json --header "Content-Type: application/json" > docker-generated.pdf`

Alternatively:
- you can run `./curl-docker.sh` to speed things up

## Deployment

Ideally, it is recommended deploy this application with AWS Elastic Beanstalk in it's own **Application**, and in it's own **Environment**.

To start off, familiarize yourself with the **[AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)** and set up a profile (profile data is being stored at ~/.aws)
Pay attention to [named profiles](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-multiple-profiles) in case you're using multiple AWS accounts!

- when AWS CLI is installed, verify it by running `aws --version`

To make things simple with AWS Elastic Beanstalk, you're going to need the **[EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)** tool for that.

- when EB CLI is installed, verify it by running `eb --version`

### Here comes the fun part:

- `eb init --profile your_profile_name` to start the interacive setup process. Select **eu-central-1** and then select **student-profile-pdf-generator**.
- `eb list` list the environments inside *student-profile-pdf-generator* Application.
- `eb deploy` to deploy your application (there is no need to build/save/zip containers and all the like, EB CLI will take care of it).
- `eb console` which will open environment's Console in a new browser window.
- `curl -X POST http://pdf-generator-production.eu-central-1.elasticbeanstalk.com/ -d @sample/sample-student.json --header "Content-Type: application/json" > eb-generated.pdf`

Alternatively:
- you can run `./curl-elastic-beanstalk.sh` to speed things up

//

curl -X POST http://localhost:9005 -d @sample/sample-student-1.json --header "Content-Type: application/json" > local-generated.pdf