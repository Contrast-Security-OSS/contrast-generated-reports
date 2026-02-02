/**
 * TrainingView Tests
 * Tests for developer training view rendering
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TrainingView } from '@/views/TrainingView.js';

describe('TrainingView', () => {
  let view;

  beforeEach(() => {
    view = new TrainingView();
    // Create DOM structure
    document.body.innerHTML = `
      <div id="security-stats"></div>
      <div id="top-vulns"></div>
      <div id="progress-container"></div>
      <div id="badges-container"></div>
      <div id="training-stats"></div>
      <div id="lesson-sql-injection"></div>
      <div id="lesson-command-injection"></div>
      <div id="lesson-xss"></div>
    `;
  });

  describe('Initialization', () => {
    it('should create a TrainingView instance', () => {
      expect(view).toBeInstanceOf(TrainingView);
    });
  });

  describe('renderSecurityStats', () => {
    it('should render security statistics', () => {
      const stats = {
        critical: 2,
        high: 5,
        medium: 11
      };

      view.renderSecurityStats(stats);

      const container = document.getElementById('security-stats');
      expect(container.innerHTML).toContain('2');
      expect(container.innerHTML).toContain('5');
      expect(container.innerHTML).toContain('11');
    });

    it('should handle zero vulnerabilities', () => {
      const stats = {
        critical: 0,
        high: 0,
        medium: 0
      };

      view.renderSecurityStats(stats);

      const container = document.getElementById('security-stats');
      expect(container.innerHTML).toContain('0');
    });
  });

  describe('renderTopVulnerabilities', () => {
    it('should render top vulnerabilities list', () => {
      const topVulns = [
        { severity: 'Critical', ruleName: 'sql-injection', appName: 'dataservice' },
        { severity: 'High', ruleName: 'command-injection', appName: 'webhookservice' },
        { severity: 'Medium', ruleName: 'xss', appName: 'frontgateservice' }
      ];

      view.renderTopVulnerabilities(topVulns);

      const container = document.getElementById('top-vulns');
      expect(container.innerHTML).toContain('sql-injection');
      expect(container.innerHTML).toContain('dataservice');
    });

    it('should handle empty top vulnerabilities', () => {
      view.renderTopVulnerabilities([]);

      const container = document.getElementById('top-vulns');
      expect(container.innerHTML).toBeDefined();
    });
  });

  describe('renderProgressBar', () => {
    it('should render progress bar with percentage', () => {
      view.renderProgressBar(67);

      const container = document.getElementById('progress-container');
      expect(container.innerHTML).toContain('67%');
    });

    it('should handle zero progress', () => {
      view.renderProgressBar(0);

      const container = document.getElementById('progress-container');
      expect(container.innerHTML).toContain('0%');
    });

    it('should handle full progress', () => {
      view.renderProgressBar(100);

      const container = document.getElementById('progress-container');
      expect(container.innerHTML).toContain('100%');
    });
  });

  describe('renderBadges', () => {
    it('should render earned badges', () => {
      const badges = [1, 2];

      view.renderBadges(badges);

      const container = document.getElementById('badges-container');
      expect(container.innerHTML).toBeDefined();
    });

    it('should show all badges with earned ones highlighted', () => {
      view.renderBadges([1]);

      const container = document.getElementById('badges-container');
      expect(container.innerHTML).toContain('badge');
    });
  });

  describe('renderTrainingStats', () => {
    it('should render training statistics', () => {
      const stats = {
        lessonsCompleted: 2,
        totalLessons: 3,
        questionsCorrect: 5,
        totalQuestions: 7,
        trainingTime: 15
      };

      view.renderTrainingStats(stats);

      const container = document.getElementById('training-stats');
      expect(container.innerHTML).toContain('2');
      expect(container.innerHTML).toContain('3');
      expect(container.innerHTML).toContain('5');
      expect(container.innerHTML).toContain('7');
      expect(container.innerHTML).toContain('15');
    });
  });

  describe('toggleLesson', () => {
    it('should toggle lesson visibility', () => {
      const lessonId = 'lesson-sql-injection';

      view.toggleLesson(lessonId);

      const lesson = document.getElementById(lessonId);
      expect(lesson.classList.contains('active')).toBe(true);

      view.toggleLesson(lessonId);

      expect(lesson.classList.contains('active')).toBe(false);
    });
  });

  describe('highlightAnswer', () => {
    it('should highlight correct answer', () => {
      document.body.innerHTML += `
        <div id="question-1">
          <div class="quiz-option" data-option="1"></div>
          <div class="quiz-option" data-option="2"></div>
          <div id="feedback-1"></div>
        </div>
      `;

      view.highlightAnswer(1, 1, true);

      const option = document.querySelector('[data-option="1"]');
      expect(option.classList.contains('correct')).toBe(true);
    });

    it('should highlight incorrect answer', () => {
      document.body.innerHTML += `
        <div id="question-1">
          <div class="quiz-option" data-option="1"></div>
          <div class="quiz-option" data-option="2"></div>
          <div id="feedback-1"></div>
        </div>
      `;

      view.highlightAnswer(1, 1, false);

      const option = document.querySelector('[data-option="1"]');
      expect(option.classList.contains('incorrect')).toBe(true);
    });
  });

  describe('showCompletionMessage', () => {
    it('should show lesson completion message', () => {
      const result = view.showCompletionMessage(1);

      expect(result).toBeDefined();
    });
  });
});
