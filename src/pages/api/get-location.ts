import { NextApiRequest, NextApiResponse } from 'next';
import NodeGeocoder from 'node-geocoder';

// Rate limiter implementation
class RateLimiter {
  private lastCall: number = 0;
  private minDelay: number;
  private fn: Function;

  constructor(fn: Function, minDelaySeconds: number) {
    this.fn = fn;
    this.minDelay = minDelaySeconds * 1000;
  }

  async call(...args: any[]) {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    
    if (timeSinceLastCall < this.minDelay) {
      await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastCall));
    }
    
    this.lastCall = Date.now();
    return this.fn(...args);
  }
}

// Initialize geocoder
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  timeout: 10000
});

// Create rate-limited geocoder function
const rateLimitedGeocode = new RateLimiter(
  (place: string) => geocoder.geocode(place),
  1
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { place } = req.query;

  if (!place || typeof place !== 'string') {
    return res.status(400).json({ error: 'Place parameter is required' });
  }

  try {
    // Call geocoding service with rate limiting
    const results = await rateLimitedGeocode.call(place);

    if (results && results.length > 0) {
      const location = results[0];
      
      return res.status(200).json({
        place: place,
        latitude: location.latitude,
        longitude: location.longitude
      });
    } else {
      return res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Determine error type
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return res.status(504).json({ error: 'Timeout error' });
      } else {
        return res.status(502).json({ error: 'Service error' });
      }
    }
    
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}