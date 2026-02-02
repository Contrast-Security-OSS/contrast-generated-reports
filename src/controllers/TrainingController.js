/**
 * TrainingController - Controller for developer training business logic
 * Manages training progress, statistics, and lesson content
 */

import { BaseController } from './BaseController.js';

export class TrainingController extends BaseController {
  /**
   * Lesson metadata
   */
  lessons = {
    'sql-injection': {
      title: 'SQL Injection',
      severity: 'CRITICAL',
      description: 'Learn about SQL Injection vulnerabilities and how to prevent them',
      location: 'PaymentController.java:55'
    },
    'command-injection': {
      title: 'Command Injection',
      severity: 'HIGH',
      description: 'Learn about Command Injection vulnerabilities and secure coding practices',
      location: 'webhookservice app.py:284'
    },
    'xss': {
      title: 'Cross-Site Scripting (XSS)',
      severity: 'MEDIUM',
      description: 'Learn about XSS vulnerabilities and output encoding',
      location: 'frontgateservice - /api/shipments/track'
    }
  };

  /**
   * Calculate vulnerability statistics by severity
   * @param {Array} vulnerabilities - Array of vulnerabilities
   * @returns {Object} Counts by severity
   */
  calculateSecurityStats(vulnerabilities) {
    const stats = {
      critical: 0,
      high: 0,
      medium: 0
    };

    vulnerabilities.forEach(vuln => {
      const severity = (vuln.severity || '').toLowerCase();

      if (severity === 'critical') {
        stats.critical++;
      } else if (severity === 'high') {
        stats.high++;
      } else if (severity === 'medium') {
        stats.medium++;
      }
    });

    return stats;
  }

  /**
   * Get top N vulnerabilities
   * @param {Array} vulnerabilities - Array of vulnerabilities
   * @param {number} limit - Number of top vulns to return
   * @returns {Array} Top vulnerabilities
   */
  getTopVulnerabilities(vulnerabilities, limit = 3) {
    return vulnerabilities.slice(0, limit).map(vuln => ({
      severity: vuln.severity,
      ruleName: vuln.rule_name || vuln.type || 'Unknown',
      appName: this._cleanAppName(vuln.application?.name || 'Unknown')
    }));
  }

  /**
   * Clean up application names
   * @param {string} name - Application name
   * @returns {string} Cleaned name
   * @private
   */
  _cleanAppName(name) {
    return name
      .replace('cargo-cats-contrast-', '')
      .replace('cargo-cats-', '');
  }

  /**
   * Calculate training progress statistics
   * @param {Object} progress - Training progress
   * @param {number} totalLessons - Total number of lessons
   * @param {number} totalQuestions - Total number of questions
   * @returns {Object} Progress statistics
   */
  calculateProgress(progress, totalLessons, totalQuestions) {
    const progressPercentage = totalLessons > 0
      ? Math.round((progress.lessonsCompleted / totalLessons) * 100)
      : 0;

    const quizPercentage = totalQuestions > 0
      ? Math.round((progress.questionsCorrect / totalQuestions) * 100)
      : 0;

    return {
      progressPercentage,
      quizPercentage,
      lessonsRemaining: totalLessons - progress.lessonsCompleted,
      badgeCount: progress.badges.length
    };
  }

  /**
   * Calculate training time in minutes
   * @param {number} startTime - Start timestamp
   * @returns {number} Minutes elapsed
   */
  calculateTrainingTime(startTime) {
    return Math.floor((Date.now() - startTime) / 60000);
  }

  /**
   * Get lesson content by ID
   * @param {string} lessonId - Lesson identifier
   * @returns {Object|null} Lesson content
   */
  getLessonContent(lessonId) {
    return this.lessons[lessonId] || null;
  }

  /**
   * Update training progress
   * @param {Object} currentProgress - Current progress
   * @param {string} action - Action type (completeLesson, correctAnswer)
   * @param {Object} data - Action data
   * @returns {Object} Updated progress
   */
  updateProgress(currentProgress, action, data = {}) {
    const updated = { ...currentProgress };

    if (action === 'completeLesson') {
      updated.lessonsCompleted++;
      if (data.lessonNumber && !updated.badges.includes(data.lessonNumber)) {
        updated.badges.push(data.lessonNumber);
      }
    } else if (action === 'correctAnswer') {
      updated.questionsCorrect++;
    }

    return updated;
  }
}
