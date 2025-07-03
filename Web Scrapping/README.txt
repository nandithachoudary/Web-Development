									UoH Alumni Directory
									 ==================

A responsive web-based portal to view, search, filter, and download alumni data of the University of Hyderabad.
Combines a beautiful frontend with real-time web scraping on the backend.

Project Structure

Web Scraping/
├── frontend/
│   ├── index.html         # UI structure
│   ├── style.css          # Modern styling with responsive layout
│   └── script.js          # Fetches, filters, and renders CSV data
├── server.js              # Puppeteer-based scraper and Express server
└── screenshots            # UI screenshots

Features

Frontend:
- Search alumni by name, degree, or graduation year  
- Filter by year and degree  
- Sortable table columns  
- Live stats: total alumni, degrees, year range  
- Download CSV  
- Refresh dataset  
- Fully responsive layout  

Backend:
- Scrapes alumni data using Puppeteer
- Automates login via provided credentials
- Extracts batches, departments, and member names
- Exports clean CSV (alumni_data.csv)
- Serves JSON data and frontend

Prerequisites:
- Node modules
- Chrome installed (for Puppeteer)
- A valid email + password for the alumni portal
- Internet access to reach: https://alumni.uohyd.ac.in/members

How to Run:
-Install dependencies
  1)Node modules
  2)puppeteer

-Install Node.js from: https://nodejs.org

-node -v
-npm -v
-npm install express puppeteer-core

-Start the server and scrape data
-Run: node server.js

-View the frontend
-Open this in your browser: http://localhost:3000/frontend/index.html

Tech Stack

| Layer       | Tools/Tech                   |
|-------------|------------------------------|
| Frontend    | HTML, CSS, JavaScript        |
| Icons       | Font Awesome                 |
| CSV Parsing | PapaParse                    |
| Backend     | Node.js, Express, Puppeteer  |
| Data Format | CSV, JSON                    |

- GET /api/alumni — Returns scraped alumni data as JSON

Output

A CSV file alumni_data.csv will be generated in the frontend folder.
The browser interface will display:
A searchable, filterable alumni table
Statistics: total alumni, degrees, and year range
Download and refresh buttons for live data

