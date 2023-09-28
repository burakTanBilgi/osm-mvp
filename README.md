![Demo GIF](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExenJ3YjFnaGtpdG5wZzV3MXk2djU2NWJiZmdqd2xnZjd6Z3FiaTNpNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tinbfZnPaF2iVOwN5B/giphy.gif)


# GPT-4 and React-Leaflet Map Integration

This project demonstrates the integration of GPT-4 and React-Leaflet to visualize geographic data. The app fetches coordinates and a location title from GPT-4 based on a user query, and then renders them as markers on a Leaflet map.

## Table of Contents
- [Introduction](#introduction)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Demo Video](#demo-video)

## Introduction
The application utilizes GPT-4 for generating coordinates and a title for a location based on the user's request. Once the information is fetched, React-Leaflet is used to mark that location on the map.

## Technologies
- OpenAI SDK
- Next.js
- React.js
- React-Leaflet
- Node.js

## Installation
1. Clone the repository
```
git clone https://github.com/developersdigest/GPT-4-LEAFLET-NEXT-JS
```
2. Navigate to the project folder and install dependencies
```
cd your-project-folder
npm install
```
3. Add your OpenAI API key to a `.env` file
```
OPENAI_API_KEY=your-api-key-here
```
4. Start the development server
```
npm run dev
```

## Usage
1. Open the application in a browser.
2. Enter a query in the input field.
3. Hit "Submit" or press Enter to get the coordinates and title which will be displayed on the map.

## Demo Video
You can watch the demo video [here](https://youtu.be/xVkbdegieBg).
