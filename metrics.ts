import { StatsD } from "node-statsd";
import { config } from "dotenv";

config(); // load environment variables
const environment = process.env.NODE_ENV || 'development';
const graphite = process.env.GRAPHITE_HOST;

let metrics: StatsD | null = null;

try {
  if (!graphite) {
    console.warn("Graphite host not configured. Metrics will be disabled.");
  } else {
    const options = {
      host: graphite,
      port: 8125,
      prefix: `${environment}.shipwrecked.`,
    };
    
    // Properly instantiate StatsD with 'new'
    metrics = new StatsD(options);
    console.log("Metrics initialized successfully with Graphite host:", graphite);
  }
} catch (error) {
  console.error("Failed to initialize metrics:", error);
}

// Create a safer version of metrics with fallbacks for all methods
const safeMetrics = {
  increment: (stat: string, value: number, sampleRate?: number, tags?: any, callback?: Function) => {
    if (metrics) {
      try {
        metrics.increment(stat, value, sampleRate, tags, callback as any);
      } catch (error) {
        console.error(`Failed to increment metric ${stat}:`, error);
      }
    }
  },
  
  // Add other methods as needed (gauge, timing, etc.)
  gauge: (stat: string, value: number, sampleRate?: number, tags?: any, callback?: Function) => {
    if (metrics) {
      try {
        metrics.gauge(stat, value, sampleRate, tags, callback as any);
      } catch (error) {
        console.error(`Failed to record gauge ${stat}:`, error);
      }
    }
  },
  
  timing: (stat: string, time: number, sampleRate?: number, tags?: any, callback?: Function) => {
    if (metrics) {
      try {
        metrics.timing(stat, time, sampleRate, tags, callback as any);
      } catch (error) {
        console.error(`Failed to record timing ${stat}:`, error);
      }
    }
  }
};

export default safeMetrics;