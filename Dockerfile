FROM node:16.13.1-alpine

WORKDIR /opt/happyshare

# BUILD TIME

ARG NEXT_PUBLIC_TITLE="Happy Share"
ENV NEXT_PUBLIC_TITLE=$NEXT_PUBLIC_TITLE
ARG NEXT_PUBLIC_HOST_URL="http://127.0.0.1:3000"
ENV NEXT_PUBLIC_HOST_URL=$NEXT_PUBLIC_HOST_URL
ARG NEXT_PUBLIC_SOCKET_URL="ws://127.0.0.1:3000"
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

COPY package.json /opt/happyshare/
COPY yarn.lock /opt/happyshare/
# RUN npm install -g yarn
RUN yarn --frozen-lockfile
RUN yarn cache clean

COPY . /opt/happyshare/
RUN yarn build

# RUN TIME

ENV HS_USERNAME=admin
ENV HS_PASSWORD=password
ENV HS_HOSTNAME=localhost
ENV HS_PORT=3000

VOLUME ["/opt/happyshare/upload"]

EXPOSE 3000
ENTRYPOINT ["yarn", "start"]
