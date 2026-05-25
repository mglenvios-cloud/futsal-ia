FROM node:20-slim

WORKDIR /app

# Install build tools and Chromium dependencies for scraper
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make gcc g++ libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libgbm1 libasound2t64 libpangocairo-1.0-0 libxss1 libgtk-3-0 \
    libxshmfence1 libglu1 chromium \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=4000
ENV FRONTEND_URL=https://frontend-mu-blond-26.vercel.app
ENV DB_PATH=/data/futsal.db

EXPOSE 4000

CMD ["npm", "start"]
