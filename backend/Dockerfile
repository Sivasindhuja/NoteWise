# FROM 
# WORKDIR 
# COPY 
# RUN 
# COPY 
# EXPOSE 
# CMD 
#what you write in a typical Dockerfile

# Use Node version 18
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]

#so you are using node js in your container,define the working directory or the root foler
#Copy the package.json for dependencies and install them in the container,copy rest of the backend code
#expose the port and run the backend code

