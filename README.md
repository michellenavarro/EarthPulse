# EarthPulse

EarthPulse is a lightweight 3D climate visualization tool built with CesiumJS.  
It presents global CO₂ emissions data on an interactive globe, using the most recent available dataset for each country.

## Features

- Interactive 3D globe powered by CesiumJS
- Country-level CO₂ emissions visualization
- Color-coded emission intensity (low, medium, high)
- Uses latest available emissions data per country

## Data Source

CO₂ emissions data is sourced from Our World in Data:  
https://github.com/owid/co2-data

## Tech Stack

- CesiumJS
- Vanilla JavaScript
- GeoJSON

## Running Locally

This project must be served via a local web server.

Example:

```bash
python3 -m http.server```

Then open:
http://localhost:8000
