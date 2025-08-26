# GT7-CAP


## Introduction

The project is built on SAP’s CAP framework and implemented in Node.js. It provides several services for processing and displaying race-related data. Using a combination of WebSocket and UDP communications, the application listens for race telemetry, logs session data, assigns drivers, and calculates key performance indicators. The provided Fiori and UI5 applications enable dashboards for drivers and race officials. This repository is intended to demonstrate a real‑world CAP application where race telemetry data is processed and visualized.

### Prerequisites
---
- have a computer with no network firewall
- be connected to the same network as the PS5 (preferably a network without firewall)
- have either: 
	- `docker` and `docker-compose`  for docker deployement
	- or `nodejs 21` and `npm` installed on your computer

### Steps
---

#### Docker deployement
- edit the `.env` file with the PLAYSTATION_IP address
- run `docker-compose up -d` in a terminal
- go to `localhost:1880` in a web browser
- locate the `Get Token` node
- edit the node with: 
	- username: `sb-default-71ddf6f6-38e3-4dd4-bc72-cdb56e1fc39d-clone!b101064|xbem-service-broker-!b43`
	- password: `24a4b20b-15ad-49ad-8184-e584faa70de2$Rn95N96K1itKQdKAa49-0bQVr1xOcLe5uYu6Ont5KEg=`

#### Node developement
- edit the `.env` file with the PLAYSTATION_IP address
- run `npm install` in a terminal
- run `npm install -g @sap/cds-dk@8` 
- run `cds deploy --profile sqlite`
- start the project using the `npm run start:sqlite` command


## Configuration
---

The application is highly configurable. Key configuration details include running profiles and external service credentials. The configuration is defined inside the package.json and CDS configuration sections.

**Profiles and Running Modes:**

| **Mode**       | **Command**          | **Description**                                                                                   |
| -------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| sqlite         | npm run start:sqlite | Uses an embedded SQLite database. And relies on the app itself for data collection                |
| plc            | npm run start:plc    | Also uses an embedded SQLite database. And relies on a `node-red` to collect data.                |
| sac (OUTDATED) | npm run start:sac    | Activates the SAC profile to connect to an external SAC OData service using provided credentials. |


### URLs

- [Live Data Dashboard](http://localhost:4004/$launchpad#GT7RaceDash-display)
- [Race Analysis](http://localhost:4004/$launchpad#SessionObject-display)
- [GT7 info](http://localhost:4004/$launchpad#GT7Info-display) (Simple demo of external service exploitation)

### Usage warnings

- When finishing a race, **you need to skip the race replay as fast as possible**, if the replay runs for more than 3 seconds, it will create duplicates in the table and may cause problems, even crashes.
- If the application crashes, go back to the [Seps](#steps) section
- Setting the driver must be done before, or during the race via the [Live Data Dashboard](http://localhost:4004/$launchpad#GT7RaceDash-display)
- Setting the driver in the analysis app does not update the driver in SAC
- If for some reason the live dashboard does not receive data, restart the router, the ps5 and go back to the [Run](#steps) section