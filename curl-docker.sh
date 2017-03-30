#!/bin/bash
# Run this script when:
# You have a running container instance of your project and you run it locally on your computer
curl -X POST http://localhost:7777 -d @sample/sample-student.json --header "Content-Type: application/json" > docker-generated.pdf