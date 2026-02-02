/**
 * TrainingModel Tests
 * Tests for developer training data fetching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrainingModel } from '@/models/TrainingModel.js';

describe('TrainingModel', () => {
  let model;

  beforeEach(() => {
    model = new TrainingModel();
  });

  describe('Initialization', () => {
    it('should create a TrainingModel instance', () => {
      expect(model).toBeInstanceOf(TrainingModel);
    });

    it('should extend BaseModel', () => {
      expect(model.fetch).toBeDefined();
      expect(model.handleError).toBeDefined();
    });
  });

  describe('fetchVulnerabilities', () => {
    it('should fetch vulnerabilities for training', async () => {
      const vulns = await model.fetchVulnerabilities({ limit: 100 });

      expect(vulns).toBeInstanceOf(Array);
    });

    it('should return empty array on error', async () => {
      // Override fetch to simulate error
      model.fetch = async () => ({ success: false, error: 'Network error' });

      const vulns = await model.fetchVulnerabilities();

      expect(vulns).toEqual([]);
    });

    it('should handle missing traces in response', async () => {
      // Override fetch to return response without traces
      model.fetch = async () => ({ success: true });

      const vulns = await model.fetchVulnerabilities();

      expect(vulns).toEqual([]);
    });
  });

  describe('getTrainingProgress', () => {
    it('should return default progress when no data stored', () => {
      const progress = model.getTrainingProgress();

      expect(progress).toHaveProperty('lessonsCompleted');
      expect(progress).toHaveProperty('questionsCorrect');
      expect(progress).toHaveProperty('badges');
      expect(progress.lessonsCompleted).toBe(0);
    });
  });

  describe('saveTrainingProgress', () => {
    it('should save training progress without throwing errors', () => {
      const progress = {
        lessonsCompleted: 2,
        questionsCorrect: 5,
        badges: [1, 2]
      };

      expect(() => model.saveTrainingProgress(progress)).not.toThrow();
    });
  });
});
