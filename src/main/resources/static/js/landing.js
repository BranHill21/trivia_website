/*  src/main/resources/static/js/landing.js
 *  =============================================================
 *  • Persists quiz in localStorage
 *  • Rewarded-ad gate for new sets
 *  • Interstitial every 10 answers
 *  • Dark-mode toggle (auto + manual)
 *  • “50-50” hint button – removes one wrong answer once per Q
 *  • Highlights all answers after selection
 *  ============================================================= */

document.addEventListener('DOMContentLoaded', async () => {
	/* ---------- THEME -------- */
	const html = document.documentElement;
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	const savedTheme  = localStorage.getItem('theme'); // 'light' | 'dark' | null

	if ((savedTheme ?? (prefersDark ? 'dark' : 'light')) === 'dark') {
	  html.classList.add('dark');
	}
	document.getElementById('theme-toggle').addEventListener('click', () => {
	  const dark = html.classList.toggle('dark');
	  localStorage.setItem('theme', dark ? 'dark' : 'light');
	});

  /* ---------- constants & helpers ---------- */
  const LS_Q     = 'quiz.questions';
  const LS_I     = 'quiz.index';
  const LS_ULOCK = 'quiz.unlocked';
  const AMOUNT   = 3;
  const INTERSTITIAL_EVERY = 10;

  const root   = document.getElementById('quiz');
  const btnNew = document.getElementById('new-set');
  let questions = loadQuestions();
  let index     = +localStorage.getItem(LS_I) || 0;
  let answered  = 0;

  /* ---------- initial load ---------- */
  if (!questions.length) {
    questions = await fetchQuestions(AMOUNT);
    saveQuestions(questions);
  }
  renderQuestion();

  /* ---------- new-set button ---------- */
  btnNew.onclick = async () => {
    if (localStorage.getItem(LS_ULOCK) !== 'true') {
      await showRewardedAd();
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

  /* ---------- persistence helpers ---------- */
  function saveQuestions(qs) {
    localStorage.setItem(LS_Q, JSON.stringify(qs));
    localStorage.setItem(LS_I, '0');
    localStorage.setItem(LS_ULOCK, 'false');
  }
  function loadQuestions() {
    const raw = localStorage.getItem(LS_Q);
    return raw ? JSON.parse(raw) : [];
  }

  /* ---------- render single question ---------- */
  function renderQuestion() {
    root.innerHTML = '';
    if (index >= questions.length) {
      root.innerHTML = '<p class="text-sub">All done! Click “New Set”.</p>';
      return;
    }

    const q = questions[index];
    const card = document.createElement('div');
    card.className = 'question';
    card.innerHTML = `<h3>Q${index + 1}. ${q.question}</h3>`;

    const btnBox = document.createElement('div');
    btnBox.className = 'answers';

    /* shuffle answers */
    const answers = [q.correctAnswer, ...q.incorrectAnswers]
      .sort(() => Math.random() - 0.5);

    answers.forEach(ans => {
      const btn = document.createElement('button');
      btn.textContent = ans;
      btn.onclick = () => handleClick(btn, ans === q.correctAnswer, btnBox, q);
      btnBox.appendChild(btn);
    });

    /* hint button (50-50)  */
    if (q.incorrectAnswers.length > 1) {
      const hint = document.createElement('button');
      hint.className = 'hint';
      hint.textContent = 'Give me a hint';
	  hint.onclick = () => {
	    const wrongBtns = [...btnBox.children].filter(
	      b => b.textContent !== q.correctAnswer && !b.dataset.removed
	    );
	    if (wrongBtns.length) {
	      /* choose random wrong button */
	      const remove = wrongBtns[Math.floor(Math.random() * wrongBtns.length)];
	      remove.style.visibility = 'hidden';
	      remove.dataset.removed = 'true';
	      hint.disabled = true;
	    }
	  };

      card.appendChild(hint);
    }

    card.appendChild(btnBox);
    root.appendChild(card);
  }

  /* ---------- answer handler ---------- */
  function handleClick(chosenBtn, isCorrect, btnBox, q) {
    if (btnBox.classList.contains('done')) return; // already answered

    /* highlight all buttons */
    [...btnBox.children].forEach(b => {
      const correct = b.textContent === q.correctAnswer;
      b.classList.add(correct ? 'correct' : 'incorrect');
      b.disabled = true;
    });
    chosenBtn.classList.add('chosen'); // emphasise user choice
    btnBox.classList.add('done');

    answered++;
    if (answered % INTERSTITIAL_EVERY === 0) showInterstitialAd();

    index++;
    localStorage.setItem(LS_I, index);
    setTimeout(renderQuestion, 1200);
  }

  /* ---------- Ad helpers ---------- */
  let _rewardResolve = null;

  function showRewardedAd() {
    return new Promise(res => {
      if (window.googletag && window.rewardedSlot) {
        _rewardResolve = res;
        googletag.cmd.push(() => googletag.pubads().refresh([rewardedSlot]));
      } else {
        console.warn('Rewarded ad not configured – auto-continue');
        res();
      }
    });
  }

  function showInterstitialAd() {
    if (window.googletag && window.interstitialSlot) {
      googletag.cmd.push(() =>
        googletag.pubads().refresh([interstitialSlot]));
    }
  }

  if (window.googletag) {
    googletag.cmd.push(() => {
      if (window.rewardedSlot) {
        rewardedSlot.addEventListener('rewardedSlotClosed', () => {
          if (_rewardResolve) _rewardResolve(), _rewardResolve = null;
        });
      }
    });
  }
});
