# Student Profile CV PDF Generator
A Node.js web-app for generating good-looking PDF Codecooler CVs based on a 'Student' JSON object. This is a subproject of [Student Profile Frontend](https://gitlab.com/codecool/student-profile-frontend).


Take a look at the [sample image here](https://gitlab.com/codecool/student-profile-cv-pdf-generator/blob/cd708c2531971b65260e061ee013c026461a4523/sample/screenshot.png) to get an idea what this tool is about (note: the layout and contents might change over time)


## Project Purpose
This project exists because there is a business need to generate PDF documents based on Codecooler metadata.


## Local Development
- clone the repo
- issue `npm install` to download the dependencies
- Take a look at **sample/sample-student.json** - this is a sample JSON that is being compiled into a PDF document
- issue `npm start` to launch the application (it should start listening on port 8080)
- send a **POST** to **localhost:8080** with the payload `curl -X POST http://localhost:8080 -d @sample/sample-student.json --header "Content-Type: application/json" > locally-generated.pdf`

Alternatively:
- You can run `./curl-local.sh` to speed things up

## Dockerizing
The application is intended to run in a Docker container.
- `docker build -t student-profile-cv-pdf-generator-img .`
- `docker run -d -p 7777:8080 --name student-profile-cv-pdf-generator-container student-profile-cv-pdf-generator-img`
- send a **POST** to **localhost:7777** with the payload `curl -X POST http://localhost:7777 -d @sample/sample-student.json --header "Content-Type: application/json" > docker-generated.pdf`

Alternatively:
- You can run `./curl-docker.sh` to speed things up

## Deployment

Ideally, it is recommended to run this project on an AWS EC2 instance, configured with AWS Elastic Beanstalk.
To make things simple, head over to this [Amazon Documentation on how to install the EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html?icmpid=docs_elasticbeanstalk_console).
It is recommended to familiarize yourself with the [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) as well.


