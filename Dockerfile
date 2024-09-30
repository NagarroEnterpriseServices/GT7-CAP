# Use multi-architecture base image for Node.js (compatible with ARM and x86)
# "node:lts" works across both architectures
FROM node:lts

# Set the working directory
WORKDIR /usr/src/app

# Copy the application files to the container
COPY . .

# Install dependencies
RUN npm install


# Expose the default port for CAP applications (4004)
EXPOSE 4004

# expose UDP port 33340 and 33339
EXPOSE 33340/udp
EXPOSE 33339/udp

# Command to run the CAP application
CMD ["npm", "start"]
