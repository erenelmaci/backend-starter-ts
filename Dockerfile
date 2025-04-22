FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm install 

COPY . .

RUN npm run build

ENV NODE_OPTIONS="--max-old-space-size=1024"

EXPOSE 8000

CMD ["npm", "dist/index.js"]