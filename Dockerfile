FROM apify/actor-node-playwright-chrome:20

COPY --chown=myuser package*.json ./
RUN npm install

COPY --chown=myuser . ./
CMD ["node", "main.js"]