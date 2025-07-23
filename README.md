# GT7-CAP

The GT7-CAP project is a Cloud Application Programming Model (CAP) application for managing race sessions and telemetry data as demonstrated during the reCAP 2024 session. The project collects race telemetry, aggregates lap and session data, and provides real‑time dashboards and Fiori applications to display results. It supports multiple operating profiles that affect how the application connects to databases or external services.

## Introduction

The project is built on SAP’s CAP framework and implemented in Node.js. It provides several services for processing and displaying race-related data. Using a combination of WebSocket and UDP communications, the application listens for race telemetry, logs session data, assigns drivers, and calculates key performance indicators. The provided Fiori and UI5 applications enable dashboards for drivers and race officials. This repository is intended to demonstrate a real‑world CAP application where race telemetry data is processed and visualized.

## Requirements

- **Node.js:** Version 20 or higher is required (see the engines property in the package.json ).
- **CAP Development Kit:** Ensure that you have the CAP development libraries, including @sap/cds-dk.
- **Database:** The application supports several backend databases. When running in different profiles, it uses either SQLite or PostgreSQL (for example, in SAC mode) depending on the configuration.
- **Other dependencies:** The repository includes dependencies such as @cap-js/postgres, @cap-js/sqlite, and WebSocket libraries.
  
## Installation

1. **Clone the repository:**
   Code block example:

   git clone https://github.com/koebelt/GT7-CAP.git
   cd GT7-CAP


3. **Install npm dependencies:**

   npm install

   This command installs all required packages as declared in the package.json .

4. **Postinstall step:**
   After installing dependencies, the project automatically generates CAP TypeScript definitions via the postinstall script.

## Configuration

The application is highly configurable. Key configuration details include running profiles and external service credentials. The configuration is defined inside the package.json and CDS configuration sections.

**Profiles and Running Modes:**

| **Mode**    | **Command**                    | **Description**                                                                                   |
|-------------|--------------------------------|---------------------------------------------------------------------------------------------------|
| sqlite      | npm run start:sqlite           | Uses an embedded SQLite database. Suitable for local testing.                                   |
| plc         | npm run start:plc              | Starts the application with the PLC service (for receiving WebSocket telemetry data).             |
| sac         | npm run start:sac              | Activates the SAC profile to connect to an external SAC OData service using provided credentials. |

The configuration files define the database connection parameters, credential URLs, and service endpoints. For example, the “sac” profile contains a configuration for an external OData service that provides additional information for session logging .

In addition, environment variables (e.g., GT_VERSION) can affect UDP ports and WebSocket endpoints as seen in the service implementations.

## Features

- **Real‑Time Race Telemetry:** Processes UDP packets and WebSocket messages representing live race telemetry data.
- **Session Logging and Data Aggregation:** Automatically creates sessions, logs lap times, and calculates statistical metrics.
- **Multiple Running Modes:** Supports different modes (sqlite, plc, and sac) to suit various deployment scenarios.
- **Driver Assignment and Updates:** Allows assignment and update of drivers for sessions.
- **Fiori and UI5 Dashboards:** Includes web applications (found under the app folder) such as GT7 Info and Race Dash that provide interactive user interfaces.
- **Cloud Event Generation:** Implements cloud event messaging for real‑time communication across services.
- **Modular Design:** Contains separate services for handling simulator data, PLC integration, and general race analytics (e.g., SIPGT7Service and GT7Service).

## Usage

After installation, select the desired mode and start the application using one of the following commands:

- **SQLite Mode:**  
  npm run start:sqlite

  This mode uses a local SQLite database, ideal for quick testing and development.

- **PLC Mode:**  
  npm run start:plc
 
  Use this mode if you want the application to listen for and process telemetry data via PLC-specific endpoints. This mode provides a dedicated service to handle WebSocket connections to an external PLC telemetry source.

- **SAC Mode:**  
  npm run start:sac
  
  Activates the SAC profile. This mode connects to an external SAC OData service to retrieve extended session information. The service details (including credentials) are configured within the CDS configuration.

Once started, the CAP runtime serves the available services and Fiori launchpad. You can open the configured UI5 applications (such as GT7 Info or Race Dash) in your browser to view the live dashboards and session reports.

This README provides the necessary documentation to install, configure, and run the GT7-CAP project. Detailed configuration settings are embedded in the project files, and proper commands for each running mode are available so that you can quickly switch between local SQLite testing, a dedicated PLC mode, or integrate with SAC services.

Enjoy using GT7-CAP, and happy racing!

