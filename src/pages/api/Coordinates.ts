import OpenAI from 'openai';
import dotenv from "dotenv";
import NodeGeocoder from 'node-geocoder';

// Initialize dotenv
dotenv.config();

// Initialize OpenAI API client
const openai = new OpenAI();

// Initialize geocoder
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  timeout: 10000
});

// Define the API handler function
export default async function handler(req: any, res: any) {
  try {
    // Step 1: Extract location entity from user query using GPT-4o-mini
    const gpt4Completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: "You are a location entity extractor. Your job is to identify and return ONLY the location mentioned in the user's query. Return just the location name without any additional text, explanations, or JSON formatting." 
        },
        { role: 'user', content: req.body.value }
      ],
    });

    // Extract the location text from GPT's response
    const locationText = gpt4Completion.choices[0]?.message?.content?.trim();
    
    if (!locationText) {
      return res.status(400).json({ error: "Could not extract a location from the input." });
    }

    console.log("Extracted location:", locationText);
    
    // Step 2: Get coordinates directly using node-geocoder
    try {
      const results = await geocoder.geocode(locationText);
      
      if (results && results.length > 0) {
        const location = results[0];
        
        // Format the response to match what the map component expects
        const responseData = {
          coordinates: [location.latitude, location.longitude],
          title: locationText
        };
        
        res.status(200).json(responseData);
        console.log(responseData);
      } else {
        res.status(404).json({ error: "Location not found." });
      }
    } catch (locationError) {
      console.error("Error getting coordinates:", locationError);
      res.status(500).json({ 
        error: "Could not retrieve coordinates for the location.", 
        locationText: locationText 
      });
    }
    
  } catch (error) {
    console.error("Error in processing request:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}