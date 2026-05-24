# Commute Checker

A lightweight browser tool that estimates commute time between a rental
and an office location using the Mapbox Directions API.

## Features

- Walking time and distance via Mapbox
- Driving time via Mapbox
- Simple verdict based on walkability thresholds

## Usage

1. Enter your office coordinates (longitude, latitude)
2. Enter the rental coordinates (longitude, latitude)
3. Hit **Calculate commute**

## Setup

This project uses the [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) 
library. To run it locally, replace the `accessToken` in `app.js` with your 
own Mapbox public token.

1. Copy `config.example.js` to `config.js`
2. Add your Mapbox public token to `config.js`
3. Open `index.html` in a browser

Open `index.html` directly in a browser — no build step needed.

## Tech

- Vanilla HTML, CSS, JavaScript
- Mapbox Directions API v5