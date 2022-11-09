FROM node:14.4.0-slim
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install

COPY . /usr/src/app

EXPOSE 5000

CMD ["npm", "start"]
