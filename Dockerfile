ARG BASE=node:14.15.1-alpine
FROM $BASE as build
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY ./tsconfig.json ./
COPY src src/
RUN npm run tsc
COPY . ./

FROM build as clean
RUN npm prune --production
RUN rm -r src

FROM $BASE
WORKDIR /app
COPY --from=build /app /app/
ENTRYPOINT ["npm", "run", "serve"]
EXPOSE 5000