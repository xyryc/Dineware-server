# Dineware Server

This repository contains the server-side code for the Dineware application.

Live: [dineware.web.app](https://dineware.web.app)

Live Backup: [dineware.surge.sh](https://dineware.surge.sh)

Client Repo: [https://github.com/xyryc/Dineware-client](https://github.com/xyryc/Dineware-client)

Server Repo: [https://github.com/xyryc/Dineware-server](https://github.com/xyryc/Dineware-server)

## Introduction

Dineware is a comprehensive restaurant management system designed to streamline operations and enhance customer experience. This server repository handles all backend functionalities.

## Features

- User authentication and authorization
- Search, Sort, Filter
- Product Management

## Installation

To get started with the server, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/xyryc/dineware-server.git
   ```
2. Navigate to the project directory:
   ```bash
   cd dineware-server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:

   Create a `.env.local` file in the root directory and add your mongodb configs.

   ```bash
    DB_USER=db_username
    DB_PASS=db_password
    SECRET_KEY=jwt_secret_key
   ```

5. Start the server:
   ```bash
   nodemon index.js
   ```

## Usage

Once the server is up and running, you can access the server from `http://localhost:5000/`.

## Contribution

Feel free to fork the repository, make improvements, and submit a pull request. For major changes, open an issue first to discuss the proposed changes.
