FROM node:18-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY package*.json ./ 
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY . .

RUN yarn build

ENV NODE_ENV production

RUN yarn install && yarn cache clean

FROM node:18-alpine As production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3090

CMD [ "node", "./dist/src/main.js" ]