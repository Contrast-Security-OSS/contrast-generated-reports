/**
 * TrainingController Tests
 * Tests for developer training business logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TrainingController } from '@/controllers/TrainingController.js';

describe('TrainingController', () => {
  let controller;

  beforeEach(() => {
    controller = new TrainingController();
  });

  describe('Initialization', () => {
    it('should create a TrainingController instance', () => {
      expect(controller).toBeInstanceOf(TrainingController);
    });

    it('should extend BaseController', () => {
      expect(controller.transform).toBeDefined();
      expect(controller.filter).toBeDefined();
    });
  });

  describe('calculateSecurityStats', () => {
    it('should calculate vulnerability counts by severity', () => {
      const vulns = [
        { severity: 'Critical' },
        { severity: 'Critical' },
        { severity: 'High' },
        { severity: 'High' },
        { severity: 'High' },
        { severity: 'Medium' },
        { severity: 'Medium' }
      ];

      const stats = controller.calculateSecurityStats(vulns);

      expect(stats.critical).toBe(2);
      expect(stats.high).toBe(3);
      expect(stats.medium).toBe(2);
    });

    it('should handle empty vulnerability array', () => {
      const stats = controller.calculateSecurityStats([]);

      expect(stats.critical).toBe(0);
      expect(stats.high).toBe(0);
      expect(stats.medium).toBe(0);
    });

    it('should handle case-insensitive severity values', () => {
      const vulns = [
        { severity: 'CRITICAL' },
        { severity: 'critical' },
        { severity: 'CrItIcAl' }
      ];

      const stats = controller.calculateSecurityStats(vulns);

      expect(stats.critical).toBe(3);
    });
  });

  describe('getTopVulnerabilities', () => {
    it('should return top N vulnerabilities', () => {
      const vulns = [
        { severity: 'Critical', rule_name: 'sql-injection', application: { name: 'app1' } },
        { severity: 'High', rule_name: 'xss', application: { name: 'app2' } },
        { severity: 'Medium', rule_name: 'path-traversal', application: { name: 'app3' } },
        { severity: 'Low', rule_name: 'info-disclosure', application: { name: 'app4' } }
      ];

      const top3 = controller.getTopVulnerabilities(vulns, 3);

      expect(top3).toHaveLength(3);
      expect(top3[0].severity).toBe('Critical');
    });

    it('should clean up application names', () => {
      const vulns = [
        { severity: 'Critical', rule_name: 'sql-injection', application: { name: 'cargo-cats-contrast-dataservice' } }
      ];

      const top = controller.getTopVulnerabilities(vulns, 1);

      expect(top[0].appName).toBe('dataservice');
    });

    it('should handle vulnerabilities without application', () => {
      const vulns = [
        { severity: 'Critical', rule_name: 'sql-injection' }
      ];

      const top = controller.getTopVulnerabilities(vulns, 1);

      expect(top[0].appName).toBe('Unknown');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate training progress percentage', () => {
      const progress = {
        lessonsCompleted: 2,
        questionsCorrect: 5,
        badges: [1, 2]
      };

      const stats = controller.calculateProgress(progress, 3, 7);

      expect(stats.progressPercentage).toBe(67); // 2/3 lessons
      expect(stats.quizPercentage).toBe(71); // 5/7 questions
    });

    it('should handle zero lessons and questions', () => {
      const progress = {
        lessonsCompleted: 0,
        questionsCorrect: 0,
        badges: []
      };

      const stats = controller.calculateProgress(progress, 3, 7);

      expect(stats.progressPercentage).toBe(0);
      expect(stats.quizPercentage).toBe(0);
    });
  });

  describe('calculateTrainingTime', () => {
    it('should calculate training time in minutes', () => {
      const startTime = Date.now() - (15 * 60 * 1000); // 15 minutes ago

      const minutes = controller.calculateTrainingTime(startTime);

      expect(minutes).toBe(15);
    });

    it('should handle zero time', () => {
      const startTime = Date.now();

      const minutes = controller.calculateTrainingTime(startTime);

      expect(minutes).toBe(0);
    });
  });

  describe('getLessonContent', () => {
    it('should return SQL injection lesson content', () => {
      const lesson = controller.getLessonContent('sql-injection');

      expect(lesson).toHaveProperty('title');
      expect(lesson).toHaveProperty('severity');
      expect(lesson).toHaveProperty('description');
      expect(lesson.title).toContain('SQL Injection');
    });

    it('should return command injection lesson content', () => {
      const lesson = controller.getLessonContent('command-injection');

      expect(lesson).toHaveProperty('title');
      expect(lesson.severity).toBe('HIGH');
    });

    it('should return XSS lesson content', () => {
      const lesson = controller.getLessonContent('xss');

      expect(lesson).toHaveProperty('title');
      expect(lesson.title).toContain('XSS');
    });

    it('should return null for unknown lesson', () => {
      const lesson = controller.getLessonContent('unknown-lesson');

      expect(lesson).toBeNull();
    });
  });

  describe('updateProgress', () => {
    it('should increment lessons completed', () => {
      const currentProgress = {
        lessonsCompleted: 1,
        questionsCorrect: 3,
        badges: [1]
      };

      const updated = controller.updateProgress(currentProgress, 'completeLesson', { lessonNumber: 2 });

      expect(updated.lessonsCompleted).toBe(2);
      expect(updated.badges).toContain(2);
    });

    it('should increment questions correct', () => {
      const currentProgress = {
        lessonsCompleted: 1,
        questionsCorrect: 3,
        badges: []
      };

      const updated = controller.updateProgress(currentProgress, 'correctAnswer');

      expect(updated.questionsCorrect).toBe(4);
    });
  });
});
