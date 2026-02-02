/**
 * TrainingView - View for developer training dashboard
 * Handles DOM manipulation and rendering for training interface
 */

export class TrainingView {
  /**
   * Render security statistics
   * @param {Object} stats - Security statistics
   */
  renderSecurityStats(stats) {
    const container = document.getElementById('security-stats');
    if (!container) return;

    container.innerHTML = `
      <div class="stat">
        <span class="stat-label">Critical Issues</span>
        <span class="stat-value critical">${stats.critical}</span>
      </div>
      <div class="stat">
        <span class="stat-label">High Severity</span>
        <span class="stat-value high">${stats.high}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Medium Severity</span>
        <span class="stat-value medium">${stats.medium}</span>
      </div>
    `;
  }

  /**
   * Render top vulnerabilities list
   * @param {Array} topVulns - Top vulnerabilities
   */
  renderTopVulnerabilities(topVulns) {
    const container = document.getElementById('top-vulns');
    if (!container) return;

    if (topVulns.length === 0) {
      container.innerHTML = '<p>No vulnerabilities found</p>';
      return;
    }

    container.innerHTML = `
      <ol>
        ${topVulns.map(vuln => `
          <li>
            <span class="${vuln.severity.toLowerCase()}">${this.escapeHtml(vuln.ruleName)}</span> -
            ${this.escapeHtml(vuln.appName)}
          </li>
        `).join('')}
      </ol>
    `;
  }

  /**
   * Render progress bar
   * @param {number} percentage - Progress percentage (0-100)
   */
  renderProgressBar(percentage) {
    const container = document.getElementById('progress-container');
    if (!container) return;

    container.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%">${percentage}%</div>
      </div>
    `;
  }

  /**
   * Render achievement badges
   * @param {Array} earnedBadges - Array of earned badge numbers
   */
  renderBadges(earnedBadges) {
    const container = document.getElementById('badges-container');
    if (!container) return;

    const allBadges = [
      { id: 1, name: '🛡️ SQL Guardian' },
      { id: 2, name: '⚡ Command Master' },
      { id: 3, name: '🎯 XSS Defender' }
    ];

    container.innerHTML = allBadges.map(badge => {
      const earned = earnedBadges.includes(badge.id);
      const opacity = earned ? '1' : '0.3';
      return `<span class="badge badge-silver" style="opacity: ${opacity}">${badge.name}</span>`;
    }).join('');
  }

  /**
   * Render training statistics
   * @param {Object} stats - Training statistics
   */
  renderTrainingStats(stats) {
    const container = document.getElementById('training-stats');
    if (!container) return;

    container.innerHTML = `
      <div class="stat">
        <span class="stat-label">Lessons Completed</span>
        <span class="stat-value">${stats.lessonsCompleted} / ${stats.totalLessons}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Quiz Score</span>
        <span class="stat-value">${stats.questionsCorrect} / ${stats.totalQuestions}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Training Time</span>
        <span class="stat-value">${stats.trainingTime} min</span>
      </div>
    `;
  }

  /**
   * Toggle lesson content visibility
   * @param {string} lessonId - Lesson DOM element ID
   */
  toggleLesson(lessonId) {
    const lesson = document.getElementById(lessonId);
    if (!lesson) return;

    lesson.classList.toggle('active');
  }

  /**
   * Highlight quiz answer
   * @param {number} questionId - Question ID
   * @param {number} optionId - Selected option ID
   * @param {boolean} correct - Whether answer is correct
   */
  highlightAnswer(questionId, optionId, correct) {
    const option = document.querySelector(`#question-${questionId} [data-option="${optionId}"]`);
    if (!option) return;

    option.classList.add(correct ? 'correct' : 'incorrect');

    const feedback = document.getElementById(`feedback-${questionId}`);
    if (feedback) {
      feedback.classList.add('show', correct ? 'correct' : 'incorrect');
    }
  }

  /**
   * Show lesson completion message
   * @param {number} lessonNumber - Lesson number
   * @returns {string} Completion message
   */
  showCompletionMessage(lessonNumber) {
    const badges = [
      '🛡️ SQL Guardian',
      '⚡ Command Master',
      '🎯 XSS Defender'
    ];

    const badge = badges[lessonNumber - 1] || 'Security Expert';

    return `🎉 Congratulations! You've completed Lesson ${lessonNumber}!\n\nYou earned the "${badge}" badge!`;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHtml(str) {
    if (!str) return '';

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
