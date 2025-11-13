// src/lib/retry.js
export async function retryAsync(fn, {
  retries = 3,
  minDelay = 1000,    // initial delay in ms
  maxDelay = 8000,    // max delay between retries
  factor = 2,         // exponential factor
  jitter = true,      // add jitter to avoid thundering herd
  shouldRetry = null  // optional fn(error) => boolean to decide whether to retry
} = {}) {
  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    try {
      return await fn(attempt); // pass attempt index to fn if it wants
    } catch (err) {
      lastError = err;
      const isRetryable = typeof shouldRetry === "function"
        ? shouldRetry(err)
        : true; // by default assume retryable (we'll pick specific checks later)

      // if not retryable or we've exhausted attempts, throw
      if (!isRetryable || attempt === retries) {
        throw lastError;
      }

      // compute delay with exponential backoff + optional jitter
      const exp = Math.min(minDelay * Math.pow(factor, attempt), maxDelay);
      const delay = jitter
        ? Math.floor(exp / 2 + Math.random() * (exp / 2))
        : exp;

      // wait
      await new Promise((res) => setTimeout(res, delay));

      attempt += 1;
    }
  }

  // if we get here, throw last error
  throw lastError;
}
