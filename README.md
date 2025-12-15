# Fleet Tracking Platform

A web-based fleet tracking platform built with Angular and TypeScript.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the mock API server**
   ```bash
   npm run api
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open the application**
   Navigate to `http://localhost:4200`

## Features

- **Admin Dashboard**: Master data management, order management, vehicle allocation, live fleet map
- **Driver Interface**: Shift management, delivery tracking, GPS updates, shift history
- **Real-time Map**: Live fleet tracking with Leaflet.js integration
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Angular 21, TypeScript, SCSS
- **Mapping**: Leaflet.js
- **Mock API**: JSON Server
- **State Management**: RxJS with direct API calls

## Build

```bash
npm run build
```

## Environment URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://fleet-tracking-be.onrender.com`