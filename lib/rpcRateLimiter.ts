// Simple rate limiter for RPC calls
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly delayMs: number;

  constructor(delayMs: number = 100) {
    this.delayMs = delayMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const fn = this.queue.shift();
    
    if (fn) {
      await fn();
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
    }

    // Process next
    this.processQueue();
  }
}

// Export singleton instance with 200ms delay between calls
export const rpcLimiter = new RateLimiter(200);

