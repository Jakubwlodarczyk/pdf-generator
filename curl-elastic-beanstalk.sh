#!/bin/bash
# Run this script when:
# You have a running container instance of your project and you run it locally on your computer
curl -X POST http://pdf-generalstor-production.eu-central-1.elasticbeanstalk.com/ -d @sample/sample-student.json --header "Content-Type: application/json" > eb-generated.pdf