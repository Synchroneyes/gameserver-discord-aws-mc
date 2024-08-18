FROM node:20.15-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm run deploy-commands

CMD ["npm", "start"]