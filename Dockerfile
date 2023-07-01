FROM ubuntu:22.04
RUN apt update -y && apt upgrade -y 
RUN apt install -y curl sudo
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - 
RUN apt install -y nodejs
RUN npm install -g yarn
RUN mkdir /app
WORKDIR /app
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc yarn install --frozen-lockfile
COPY ./public /app/public
COPY ./src /app/src
COPY ./tsconfig.json /app/tsconfig.json
ENTRYPOINT ["yarn", "start"]
