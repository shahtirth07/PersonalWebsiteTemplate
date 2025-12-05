const seenJobs = new Map();

export const memoryStore = {
  has(jobId) {
    return seenJobs.has(jobId);
  },

  add(jobId, payload) {
    seenJobs.set(jobId, { ...payload, storedAt: Date.now() });
  },

  prune(maxAgeMinutes = 1440) {
    const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
    for (const [jobId, payload] of seenJobs.entries()) {
      if (payload.storedAt < cutoff) {
        seenJobs.delete(jobId);
      }
    }
  }
};


