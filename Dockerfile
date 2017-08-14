FROM node:8-onbuild
COPY package.json .
RUN npm install
COPY index.js .
ENV NODE_ENV production
CMD [ "npm", "start" ]
EXPOSE 9005
