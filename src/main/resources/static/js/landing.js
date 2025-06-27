/*  src/main/resources/static/js/landing.js
 *  =============================================================
 *  • Streak & longest streak (persists per session)
 *  • Perfect-set difficulty ladder: easy → medium → any
 *  • “New Set” button appears only after finishing current set
 *  • Interstitial every 10 answers + rewarded gate
 *  • Mobile + desktop streak UI (🔥 current / max)
 *  • Dark-mode toggle, 50-50 hint, responsive layout
 *  ============================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  /* ---------- THEME --------------------------------------- */
  const html = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme  = localStorage.getItem('theme');
  if ((savedTheme ?? (prefersDark ? 'dark' : 'light')) === 'dark') {
    html.classList.add('dark');
  }
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const d = html.classList.toggle('dark');
    localStorage.setItem('theme', d ? 'dark' : 'light');
  });
  
  /* ----- slide-out menu toggle & overlay ----- */
  const menuBtn  = document.getElementById('menu-btn');
  const sideMenu = document.getElementById('side-menu');
  const overlay  = document.getElementById('menu-overlay');

  function openMenu(){
    sideMenu.classList.add('open');
    overlay.classList.add('show');
  }
  function closeMenu(){
    sideMenu.classList.remove('open');
    overlay.classList.remove('show');
  }

  menuBtn.addEventListener('click', () =>
    sideMenu.classList.contains('open') ? closeMenu() : openMenu()
  );

  overlay.addEventListener('click', closeMenu);       // tap anywhere to close
  sideMenu.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', closeMenu)         // tap a link → close
  );

  /* ---------- CONSTANTS ----------------------------------- */
  const AMOUNT        = 3;
  const INTER_AD      = 10;
  const LS_QUEST      = 'quiz.questions';
  const LS_INDEX      = 'quiz.index';
  const LS_ULOCK      = 'quiz.unlocked';
  const LS_STREAK     = 'quiz.streak';
  const LS_HIGH       = 'quiz.high';
  const LS_DIFF       = 'quiz.diff';

  /* ---------- DOM ELEMENTS -------------------------------- */
  const root       = document.getElementById('quiz');
  const btnNew     = document.getElementById('new-set');
  const streakBig  = document.getElementById('streak-desktop');      // desktop pill
  const sNowMobile = document.getElementById('streak-now');          // mobile badge
  const sMaxMobile = document.getElementById('streak-max');

  /* ---------- STATE --------------------------------------- */
  let streak      = +localStorage.getItem(LS_STREAK) || 0;
  let high        = +localStorage.getItem(LS_HIGH)   || 0;
  let difficulty  = localStorage.getItem(LS_DIFF)    || 'easy';
  if (streak === 0) difficulty = 'easy';                       // safety reset

  let questions   = loadJSON(LS_QUEST) || [];
  let index       = +(localStorage.getItem(LS_INDEX) || 0);
  let correctInSet= 0;                                          // NEW counter
  let answered    = 0;                                          // for interstitial pacing

  /* ---------- INIT ---------------------------------------- */
  updateStreakUI();
  if (!questions.length) await startNewSet();
  renderQuestion();

  /* ---------- NEW-SET BUTTON ------------------------------ */
  /*btnNew.style.display = 'none';*/
  btnNew.onclick = async () => {
	/*uncomment for ads*/
    /*if (localStorage.getItem(LS_ULOCK) !== 'true') {
      await showRewardedAd();
      localStorage.setItem(LS_ULOCK, 'true');
    }*/
    await startNewSet();
    renderQuestion();
  };

  /* ---------- RENDER QUESTION ----------------------------- */
  function renderQuestion() {
    root.innerHTML = '';

    /* Set finished -------------------------------------------------- */
    if (index >= questions.length) {
      root.innerHTML =
        `<p class="text-sub">Set complete! 🔥 Current streak ${streak}</p>`;
      btnNew.style.display = 'block';
      return;
    }
	else {
		btnNew.style.display = 'none';
	}


    /* Build card ---------------------------------------------------- */
    const q   = questions[index];
    const card= document.createElement('div');
    card.className = 'question';
    card.innerHTML = `<h3>Q${index + 1}. ${q.question}</h3>`;

    const btnBox = document.createElement('div');
    btnBox.className = 'answers';

    [...q.incorrectAnswers, q.correctAnswer]
      .sort(() => Math.random() - 0.5)
      .forEach(ans => {
        const b = document.createElement('button');
        b.textContent = ans;
        b.onclick = () => handleAnswer(b, ans === q.correctAnswer, q, btnBox);
        btnBox.appendChild(b);
      });

    /* 50-50 hint ---------------------------------------------------- */
    if (q.incorrectAnswers.length > 1) {
      const hint = document.createElement('button');
      hint.className = 'hint';
      hint.textContent = 'Give me a hint';
      hint.onclick = () => {
        const wrong = [...btnBox.children].filter(
          b => b.textContent !== q.correctAnswer && b.style.visibility !== 'hidden'
        );
        if (wrong.length) {
          wrong[Math.floor(Math.random() * wrong.length)].style.visibility = 'hidden';
          hint.disabled = true;
        }
      };
      card.appendChild(hint);
    }

    card.appendChild(btnBox);
    root.appendChild(card);
  }

  /* ---------- ANSWER HANDLER ------------------------------------- */
  function handleAnswer(btn, isCorrect, q, btnBox) {
    if (btnBox.classList.contains('done')) return;

    /* colour all buttons */
    [...btnBox.children].forEach(b => {
      const good = b.textContent === q.correctAnswer;
      b.classList.add(good ? 'correct' : 'incorrect');
      b.disabled = true;
    });
    btn.classList.add('chosen');
    btnBox.classList.add('done');

    answered++;
    if (answered % INTER_AD === 0) showInterstitialAd();

    /* streak & difficulty logic */
    if (isCorrect) {
      streak++; high = Math.max(high, streak);
      correctInSet++;
    } else {
      streak = 0; difficulty = 'easy'; correctInSet = 0;
    }
    persistStreak(); updateStreakUI();

    index++; localStorage.setItem(LS_INDEX, index);

    /* End of set ---------------------------------------------------- */
    if (index >= questions.length) {
      if (correctInSet === AMOUNT) {            // perfect!
        if (difficulty === 'easy')      difficulty = 'medium';
        else if (difficulty === 'medium') difficulty = 'any';
      }
    }

    setTimeout(renderQuestion, 1500);
  }

  /* ---------- START A NEW SET ------------------------------------ */
  async function startNewSet() {
    questions = await fetchQuestions(AMOUNT, difficulty);
    saveJSON(LS_QUEST, questions);
    index = 0; correctInSet = 0;
    localStorage.setItem(LS_INDEX, '0');
    localStorage.setItem(LS_ULOCK, 'false');
    btnNew.style.display = 'none';
	renderQuestion();
  }

  /* ---------- FETCH QUESTIONS ------------------------------------ */
  async function fetchQuestions(amount, diff) {
    let url = `/api/questions?amount=${amount}`;
    if (diff !== 'any') url += `&difficulty=${diff}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('API ' + r.status);
    return r.json();
  }

  /* ---------- STREAK UI ------------------------------------------ */
  function updateStreakUI() {
    streakBig.innerHTML =
      `Current 🔥 <span id="streak-now-big">${streak}</span> / Max <span id="streak-max-big">${high}</span>`;
    sNowMobile.textContent = streak;
    sMaxMobile.textContent = high;
  }

  function persistStreak() {
    localStorage.setItem(LS_STREAK, streak);
    localStorage.setItem(LS_HIGH,   high);
    localStorage.setItem(LS_DIFF,   difficulty);
  }

  /* ---------- STORAGE HELPERS ------------------------------------ */
  function saveJSON(k, obj) { localStorage.setItem(k, JSON.stringify(obj)); }
  function loadJSON(k) { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; }

  /* ---------- ADS (unchanged) ------------------------------------ */
  /*let _rewardResolve = null;
  function showRewardedAd() {
    return new Promise(res => {
      if (window.googletag && window.rewardedSlot) {
        _rewardResolve = res;
        googletag.cmd.push(() => googletag.pubads().refresh([rewardedSlot]));
      } else res();
    });
  }
  function showInterstitialAd() {
    if (window.googletag && window.interstitialSlot) {
      googletag.cmd.push(() => googletag.pubads().refresh([interstitialSlot]));
    }
  }
  if (window.googletag) {
    googletag.cmd.push(() => {
      if (window.rewardedSlot) {
        rewardedSlot.addEventListener('rewardedSlotClosed', () => {
          if (_rewardResolve) { _rewardResolve(); _rewardResolve = null; }
        });
      }
    });
  }*/
  
  
});
