import { startStatsService } from './service';

// Start the service
startStatsService().catch(error => {
  console.error('Failed to start stats service:', error);
}); 