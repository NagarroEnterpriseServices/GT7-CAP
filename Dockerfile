# Use multi-architecture base image for Node.js (compatible with ARM and x86)
# "node:lts" works across both architectures
FROM node:lts

# Set the working directory
WORKDIR /usr/src/app

# install nano and iproute2
RUN apt-get update && apt-get install -y nano iproute2



# Copy the application files to the container
COPY . .

# Install dependencies
RUN npm install


# Expose the default port for CAP applications (4004)
EXPOSE 4004

# expose UDP port 33340 and 33339 for GTSport
EXPOSE 33340/udp
EXPOSE 33339/udp

# expose UDP port 33740 and 33739 for GT7
# EXPOSE 33740/udp
# EXPOSE 33739/udp

# Command to run the CAP application
CMD ["npm", "run", "start:sqlite"]
