/*  src/main/resources/static/js/landing.js
 *  =================================================
 *  • Persists the current question set & index in localStorage
 *  • Gates each NEW set behind a rewarded ad
 *  • Shows an interstitial every 10 answered questions
 *  • Works even if GPT / ads aren’t wired yet (graceful fallback)
 *  ------------------------------------------------- */

document.addEventListener('DOMContentLoaded', async () => {
  /* ---------- constants & helpers ---------- */
  const LS_Q     = 'quiz.questions';
  const LS_I     = 'quiz.index';
  const LS_ULOCK = 'quiz.unlocked';
  const AMOUNT   = 3;                 // questions per set
  const INTERSTITIAL_EVERY = 10;      // answered before interstitial

  const root     = document.getElementById('quiz');
  const btnNew   = document.getElementById('new-set');
  let questions  = loadQuestions();
  let index      = +localStorage.getItem(LS_I) || 0;
  let answered   = 0;                 // session-only counter

  /* ---------- initial load ---------- */
  if (!questions.length) {
    questions = await fetchQuestions(AMOUNT);   // first set is free
    saveQuestions(questions);
  }
  renderQuestion();

  /* ---------- “New set” button ---------- */
  btnNew.onclick = async () => {
    if (localStorage.getItem(LS_ULOCK) !== 'true') {
      await showRewardedAd();                   // gate behind rewarded
      localStorage.setItem(LS_ULOCK, 'true');
    }
    questions = await fetchQuestions(AMOUNT);
    saveQuestions(questions);
    index = 0;
    renderQuestion();
  };

  /* ---------- fetch wrapper ---------- */
  async function fetchQuestions(amount) {
    const res = await fetch(`/api/questions?amount=${amount}`);
    if (!res.ok) throw new Error('API error ' + res.status);
    return res.json();
  }

  /* ---------- persistence ---------- */
  function saveQuestions(qs) {
    localStorage.setItem(LS_Q, JSON.stringify(qs));
    localStorage.setItem(LS_I, '0');
    localStorage.setItem(LS_ULOCK, 'false');
  }
  function loadQuestions() {
    const raw = localStorage.getItem(LS_Q);
    return raw ? JSON.parse(raw) : [];
  }

  /* ---------- UI render ---------- */
  function renderQuestion() {
    root.innerHTML = '';                         // clear previous
    if (index >= questions.length) {
      root.innerHTML = '<p>All done! Click “New set”.</p>';
      return;
    }

    const q = questions[index];
    const wrapper = document.createElement('div');
    wrapper.className = 'question';
    wrapper.innerHTML = `<h3>Q${index + 1}. ${q.question}</h3>`;

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
  }

  /* ---------- answer handler ---------- */
  function handleClick(button, isCorrect) {
    if (button.parentElement.classList.contains('done')) return; // already answered

    button.classList.add(isCorrect ? 'correct' : 'incorrect');
    button.parentElement.classList.add('done');
    button.parentElement.querySelectorAll('button')
          .forEach(b => (b.disabled = true));

    answered++;
    if (answered % INTERSTITIAL_EVERY === 0) showInterstitialAd();

    index++;
    localStorage.setItem(LS_I, index);
    setTimeout(renderQuestion, 600);             // next Q after brief pause
  }

  /* ---------- Ad helpers ---------- */
  let _rewardResolve = null;

  function showRewardedAd() {
    return new Promise(res => {
      // If GPT rewarded slot is configured, trigger it
      if (window.googletag && window.rewardedSlot) {
        _rewardResolve = res;
        googletag.cmd.push(() => googletag.pubads().refresh([rewardedSlot]));
      } else {
        console.warn('Rewarded ad not configured – auto-continuing');
        res();                                   // fallback: just continue
      }
    });
  }

  function showInterstitialAd() {
    if (window.googletag && window.interstitialSlot) {
      googletag.cmd.push(() =>
          googletag.pubads().refresh([interstitialSlot]));
    } else {
      console.info('Interstitial slot not ready');
    }
  }

  /* Hook rewarded close event (if GPT present) */
  if (window.googletag) {
    googletag.cmd.push(() => {
      if (window.rewardedSlot) {
        rewardedSlot.addEventListener('rewardedSlotClosed', () => {
          if (typeof _rewardResolve === 'function') {
            _rewardResolve();
            _rewardResolve = null;
          }
        });
      }
    });
  }
});
