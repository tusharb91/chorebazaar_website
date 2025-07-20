

// requestLimiter.ts

let requestCount = 0;
const REQUEST_LIMIT = 8640; // Adjust this based on your Amazon API quota
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Reset the request count every 24 hours
setInterval(() => {
  requestCount = 0;
  console.log('Request count reset');
}, RESET_INTERVAL);

export function canMakeRequest(): boolean {
  const allowed = requestCount < REQUEST_LIMIT;
  console.log(`API request attempt: ${allowed ? 'Allowed' : 'Blocked'} (${requestCount}/${REQUEST_LIMIT})`);
  return allowed;
}

export function incrementRequestCount(): void {
  requestCount++;
  console.log(`Amazon API request count incremented to: ${requestCount}`);
}

export function getRemainingRequests(): number {
  return REQUEST_LIMIT - requestCount;
}

export function getRequestCount(): number {
  return requestCount;
}