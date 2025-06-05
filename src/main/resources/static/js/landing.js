// src/main/resources/static/js/landing.js
// ---------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // ---------- 1. fetch 3 questions ----------
  fetch('/api/questions?amount=3')
    .then(r => r.json())
    .then(renderQuiz)
    .catch(err => {
      document.getElementById('quiz').textContent = err;
      console.error(err);
    });

  // ---------- 2. render ----------
  function renderQuiz(questions) {
    const root = document.getElementById('quiz');
    questions.forEach((q, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'question';

      // question text
      wrapper.innerHTML = `<h3>Q${idx + 1}. ${q.question}</h3>`;

      // shuffle answers
      const answers = [q.correctAnswer, ...q.incorrectAnswers]
                      .sort(() => Math.random() - 0.5);

      const btnBox = document.createElement('div');
      btnBox.className = 'answers';

      answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.textContent = ans;
        btn.onclick = () => handleClick(btn, ans === q.correctAnswer);
        btnBox.appendChild(btn);
      });

      wrapper.appendChild(btnBox);
      root.appendChild(wrapper);
    });
  }

  // ---------- 3. click handler ----------
  function handleClick(button, isCorrect) {
    const already =
      button.classList.contains('correct') ||
      button.classList.contains('incorrect');
    if (already) return; // ignore 2nd click on same Q

    button.classList.add(isCorrect ? 'correct' : 'incorrect');

    // disable all buttons in the same answer set
    button.parentElement
          .querySelectorAll('button')
          .forEach(b => (b.disabled = true));
  }
});
