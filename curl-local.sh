#!/bin/bash
# This script when:
# You are messing with the HTML/CSS template. There's no need to build a docker image in this case.
# What this script does:
# 1. Launching a server on 8080
# 2. Sending a POST request to the script with the json payload
# 3. Generating locally-generated.pdf into the project dir
# 4. Kill the server and afterwards the process that is listening on 8080

npm start &
TASK_PID=$!
sleep 2
curl -X POST http://localhost:8080 -d @sample/sample-student.json --header "Content-Type: application/json" > locally-generated.pdf
kill $TASK_PID
PORT=`fuser 8080/tcp`
kill $PORT

# NOTE: run 'npm install' to download the dependecies locally into the node_modules dir