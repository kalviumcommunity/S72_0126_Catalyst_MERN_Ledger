    # 1. Use an official runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# 4. Copy the rest of your app code
COPY . .

# 5. Build the app (if applicable, like React) or just expose port
# RUN npm run build
EXPOSE 3000

# 6. Define the command to run your app
CMD ["npm", "start"]