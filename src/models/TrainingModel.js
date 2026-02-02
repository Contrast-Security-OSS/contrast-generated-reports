/**
 * TrainingModel - Model for developer training data
 * Handles fetching vulnerabilities and managing training progress
 */

import { BaseModel } from './BaseModel.js';

export class TrainingModel extends BaseModel {
  /**
   * Fetch vulnerabilities for training dashboard
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} Array of vulnerabilities
   */
  async fetchVulnerabilities(options = {}) {
    const { limit = 100 } = options;
    const url = `${this.baseUrl}/orgtraces/filter?expand=skip_links&limit=${limit}`;

    const response = await this.fetch(url);

    if (!response.success) {
      this.handleError('fetchVulnerabilities', new Error(response.error));
      return [];
    }

    return response.traces || [];
  }

  /**
   * Get training progress from localStorage
   * @returns {Object} Training progress
   */
  getTrainingProgress() {
    try {
      const stored = localStorage.getItem('trainingProgress');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      this.handleError('getTrainingProgress', error);
    }

    return {
      lessonsCompleted: 0,
      questionsCorrect: 0,
      badges: [],
      startTime: Date.now()
    };
  }

  /**
   * Save training progress to localStorage
   * @param {Object} progress - Training progress to save
   */
  saveTrainingProgress(progress) {
    try {
      localStorage.setItem('trainingProgress', JSON.stringify(progress));
    } catch (error) {
      this.handleError('saveTrainingProgress', error);
    }
  }
}
