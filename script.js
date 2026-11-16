(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  $('[data-year]').textContent = new Date().getFullYear();

  const header = $('[data-header]');
  const setHeaderState = () => header.classList.toggle('is-stuck', window.scrollY > 18);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach((item) => observer.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add('is-visible'));
  }

  const GAME_KEY = 'tur11-browser-team-v1';
  const POSITION_ORDER = ['gk', 'def', 'mid', 'fwd'];
  const POSITION_LABELS = { gk: 'ВР', def: 'ЗАЩ', mid: 'ПЗ', fwd: 'НАП' };
  const PLAYERS = [
    { id: 'belov', name: 'Артём Белов', club: 'Север', position: 'gk', price: 5.2, form: 'Отличная', lastPoints: 7 },
    { id: 'radov', name: 'Илья Радов', club: 'Волна', position: 'gk', price: 4.7, form: 'Стабильная', lastPoints: 5 },
    { id: 'orlov', name: 'Денис Орлов', club: 'Север', position: 'def', price: 7.3, form: 'Отличная', lastPoints: 8 },
    { id: 'vasin', name: 'Павел Васин', club: 'Маяк', position: 'def', price: 6.9, form: 'Хорошая', lastPoints: 6 },
    { id: 'gromov', name: 'Кирилл Громов', club: 'Факел', position: 'def', price: 6.5, form: 'Хорошая', lastPoints: 5 },
    { id: 'danilov', name: 'Егор Данилов', club: 'Волна', position: 'def', price: 5.8, form: 'Стабильная', lastPoints: 4 },
    { id: 'romanov', name: 'Максим Романов', club: 'Маяк', position: 'def', price: 5.4, form: 'Набирает форму', lastPoints: 6 },
    { id: 'filatov', name: 'Степан Филатов', club: 'Орбита', position: 'def', price: 4.9, form: 'Стабильная', lastPoints: 3 },
    { id: 'sokolov', name: 'Антон Соколов', club: 'Север', position: 'mid', price: 9.4, form: 'Отличная', lastPoints: 11 },
    { id: 'lebedev', name: 'Михаил Лебедев', club: 'Маяк', position: 'mid', price: 8.7, form: 'Отличная', lastPoints: 9 },
    { id: 'klimov', name: 'Роман Климов', club: 'Волна', position: 'mid', price: 8.1, form: 'Хорошая', lastPoints: 7 },
    { id: 'zhukov', name: 'Вадим Жуков', club: 'Факел', position: 'mid', price: 7.9, form: 'Хорошая', lastPoints: 8 },
    { id: 'melnikov', name: 'Олег Мельников', club: 'Орбита', position: 'mid', price: 6.8, form: 'Набирает форму', lastPoints: 5 },
    { id: 'tarasov', name: 'Никита Тарасов', club: 'Волна', position: 'mid', price: 6.1, form: 'Стабильная', lastPoints: 4 },
    { id: 'voronin', name: 'Алексей Воронин', club: 'Север', position: 'fwd', price: 10.3, form: 'Отличная', lastPoints: 12 },
    { id: 'mironov', name: 'Иван Миронов', club: 'Маяк', position: 'fwd', price: 9.6, form: 'Хорошая', lastPoints: 8 },
    { id: 'frolov', name: 'Матвей Фролов', club: 'Факел', position: 'fwd', price: 8.4, form: 'Хорошая', lastPoints: 7 },
    { id: 'markov', name: 'Глеб Марков', club: 'Орбита', position: 'fwd', price: 7.2, form: 'Набирает форму', lastPoints: 6 },
    { id: 'ustinov', name: 'Лев Устинов', club: 'Волна', position: 'fwd', price: 6.6, form: 'Стабильная', lastPoints: 4 }
  ];
  const STARTER_IDS = ['belov', 'orlov', 'vasin', 'gromov', 'sokolov', 'lebedev', 'klimov', 'zhukov', 'voronin', 'mironov', 'frolov'];
  const byId = Object.fromEntries(PLAYERS.map((player) => [player.id, player]));
  const gameRoot = $('[data-game-root]');
  const gameStatus = $('[data-game-status]');
  const gameField = $('[data-game-field]');
  const gamePanel = $('[data-game-panel]');
  const gameTabs = $$('[data-game-tab]');
  const resetGame = $('[data-game-reset]');
  let activeGameTab = 'lineup';
  let selectedOutgoing = null;
  let gameNotice = '';
  let persistenceAvailable = true;

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
  const price = (value) => value.toFixed(1).replace('.', ',');
  const todayKey = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const todayEpochDay = () => {
    const date = new Date();
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  };
  const seedFrom = (value) => [...value].reduce((total, char) => total + char.charCodeAt(0), 0);
  const positiveMod = (value, divisor) => ((value % divisor) + divisor) % divisor;
  const teamPlayers = (team) => team.roster.map((id) => byId[id]).filter(Boolean);
  const teamCost = (team) => teamPlayers(team).reduce((sum, player) => sum + player.price, 0);
  const balance = (team) => team.budget - teamCost(team);
  const isValidTeam = (team) => {
    if (!team || typeof team.name !== 'string' || !Array.isArray(team.roster) || team.roster.length !== 11) return false;
    const squad = teamPlayers(team);
    return squad.length === 11 && new Set(team.roster).size === 11 && team.captain in byId && team.roster.includes(team.captain) &&
      squad.filter((player) => player.position === 'gk').length === 1 &&
      squad.filter((player) => player.position === 'def').length === 3 &&
      squad.filter((player) => player.position === 'mid').length === 4 &&
      squad.filter((player) => player.position === 'fwd').length === 3 && balance(team) >= 0;
  };
  const newTeam = (name) => ({
    name,
    roster: [...STARTER_IDS],
    captain: 'sokolov',
    budget: 100,
    totalPoints: 0,
    tours: 0,
    transfers: 0,
    lastPlayedDate: '',
    lastTeamScore: 0,
    lastBotScore: 0
  });
  const loadTeam = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(GAME_KEY));
      return isValidTeam(saved) ? saved : null;
    } catch {
      persistenceAvailable = false;
      return null;
    }
  };
  const saveTeam = (team) => {
    try {
      localStorage.setItem(GAME_KEY, JSON.stringify(team));
      persistenceAvailable = true;
      return true;
    } catch {
      persistenceAvailable = false;
      return false;
    }
  };
  const clearSavedTeam = () => {
    try {
      localStorage.removeItem(GAME_KEY);
      persistenceAvailable = true;
    } catch {
      persistenceAvailable = false;
    }
  };
  let browserTeam = loadTeam();

  const flash = (message) => { gameNotice = message; };
  const updateTeam = (nextTeam, message = '') => {
    browserTeam = nextTeam;
    const saved = saveTeam(nextTeam);
    flash(saved ? message : `${message ? `${message} ` : ''}Браузер запретил локальное сохранение: игра продолжится в этой вкладке, но прогресс не сохранится после её закрытия.`);
    renderGame();
  };
  const playerDotClass = (player, index) => {
    const order = { gk: ['gk'], def: ['d1', 'd2', 'd3'], mid: ['m1', 'm2', 'm3', 'm4'], fwd: ['f1', 'f2', 'f3'] };
    return `game-dot--${order[player.position][index]}`;
  };
  const splitByPosition = (team) => POSITION_ORDER.flatMap((position) => teamPlayers(team).filter((player) => player.position === position));
  const getPositionIndex = (team, player) => teamPlayers(team).filter((item) => item.position === player.position).findIndex((item) => item.id === player.id);
  const renderField = () => {
    if (!browserTeam) {
      gameField.innerHTML = `<div class="game-field__empty"><span>11</span><b>Создай клуб,<br />чтобы выйти на поле</b></div>`;
      return;
    }
    const dots = splitByPosition(browserTeam).map((player) => {
      const isCaptain = player.id === browserTeam.captain;
      return `<button type="button" class="game-dot ${playerDotClass(player, getPositionIndex(browserTeam, player))} ${isCaptain ? 'is-captain' : ''}" data-game-action="captain" data-player="${player.id}" aria-label="Назначить ${escapeHtml(player.name)} капитаном"><span>${escapeHtml(player.name.at(0))}</span>${isCaptain ? '<small>×2</small>' : ''}</button>`;
    }).join('');
    gameField.innerHTML = `<span class="game-field__title">${escapeHtml(browserTeam.name)} · 1–3–4–3</span><span class="game-field__line"></span><span class="game-field__circle"></span>${dots}`;
  };
  const renderStatus = () => {
    if (!browserTeam) {
      gameStatus.innerHTML = `<div><span class="game-status__eyebrow">ВЕБ-ВЕРСИЯ TUR11</span><strong>Новый клуб</strong></div><span class="game-status__local">${persistenceAvailable ? 'Только этот браузер' : 'Без сохранения'}</span>`;
      return;
    }
    const played = browserTeam.lastPlayedDate === todayKey();
    gameStatus.innerHTML = `<div><span class="game-status__eyebrow">${played ? 'МАТЧДЕЙ ЗАВЕРШЁН' : 'МАТЧДЕЙ ОТКРЫТ'}</span><strong>${escapeHtml(browserTeam.name)}</strong></div><div class="game-score"><span><b>${browserTeam.totalPoints}</b> очков</span><span><b>${browserTeam.tours}</b> туров</span></div>`;
  };
  const lineupPanel = (team) => {
    const rows = POSITION_ORDER.map((position) => teamPlayers(team).filter((player) => player.position === position).map((player) => {
      const captain = player.id === team.captain;
      return `<article class="game-player ${captain ? 'is-captain' : ''}">
        <span class="game-player__position game-player__position--${player.position}">${POSITION_LABELS[player.position]}</span>
        <div class="game-player__main"><b>${escapeHtml(player.name)} ${captain ? '<em>×2</em>' : ''}</b><small>${escapeHtml(player.club)} · ${escapeHtml(player.form)} · ${player.lastPoints} оч. прошлый тур</small></div>
        <span class="game-player__price">${price(player.price)} млн</span>
        <div class="game-player__actions"><button type="button" data-game-action="captain" data-player="${player.id}" ${captain ? 'disabled' : ''}>${captain ? 'Капитан' : 'Капитан ×2'}</button><button type="button" data-game-action="transfer" data-player="${player.id}">Заменить</button></div>
      </article>`;
    }).join('')).join('');
    return `<div class="game-panel__heading"><div><span>ТВОЙ СОСТАВ</span><h3>Решения на тур</h3></div><p>Нажми на игрока на поле или назначь капитана в списке. Капитан получает двойной вклад в итог дуэли.</p></div><div class="game-budget"><span>СВОБОДНО</span><b>${price(balance(team))} млн</b><i></i><span>${team.transfers} трансферов за сезон</span></div><div class="game-roster">${rows}</div>${gameNotice ? `<p class="game-notice">${escapeHtml(gameNotice)}</p>` : ''}`;
  };
  const transferPanel = (team) => {
    if (!selectedOutgoing || !team.roster.includes(selectedOutgoing)) {
      return `<div class="game-panel__heading"><div><span>ТРАНСФЕРЫ</span><h3>Сначала выбери игрока</h3></div><p>Открой вкладку «Состав» и нажми «Заменить» у игрока, которого хочешь вывести из команды.</p></div><button class="game-action game-action--wide" type="button" data-game-action="open-lineup">Открыть состав</button>`;
    }
    const outgoing = byId[selectedOutgoing];
    const candidates = PLAYERS.filter((player) => player.position === outgoing.position && !team.roster.includes(player.id));
    const cards = candidates.map((candidate) => {
      const possible = teamCost(team) - outgoing.price + candidate.price <= team.budget;
      return `<article class="transfer-option"><span class="game-player__position game-player__position--${candidate.position}">${POSITION_LABELS[candidate.position]}</span><div><b>${escapeHtml(candidate.name)}</b><small>${escapeHtml(candidate.club)} · ${escapeHtml(candidate.form)} · ${candidate.lastPoints} оч. прошлый тур</small></div><div class="transfer-option__right"><b>${price(candidate.price)} млн</b><button type="button" data-game-action="confirm-transfer" data-player="${candidate.id}" ${possible ? '' : 'disabled'}>${possible ? 'Взять' : 'Лимит'}</button></div></article>`;
    }).join('');
    return `<div class="game-panel__heading"><div><span>ТРАНСФЕР</span><h3>Найди замену</h3></div><p>Можно менять только игрока на той же позиции. Состав и бюджет после трансфера проверяются автоматически.</p></div><div class="outgoing-player"><span>УХОДИТ</span><b>${escapeHtml(outgoing.name)}</b><small>${POSITION_LABELS[outgoing.position]} · ${price(outgoing.price)} млн</small><button type="button" data-game-action="open-lineup">Выбрать другого</button></div><div class="transfer-list">${cards}</div>${gameNotice ? `<p class="game-notice">${escapeHtml(gameNotice)}</p>` : ''}`;
  };
  const duelPanel = (team) => {
    const played = team.lastPlayedDate === todayKey();
    if (!played) {
      return `<div class="game-panel__heading"><div><span>ДУЭЛЬ С ИИ</span><h3>«Тактик» ждёт</h3></div><p>Один матчдей — одна попытка. Перед стартом проверь состав и капитана: результат сегодня нельзя будет переиграть.</p></div><div class="duel-preview"><div><small>${escapeHtml(team.name)}</small><b>?</b></div><strong>VS</strong><div><small>Тактик / ИИ</small><b>?</b></div></div><button class="game-action game-action--coral game-action--wide" type="button" data-game-action="play-duel">Запустить дуэль</button>`;
    }
    const won = team.lastTeamScore > team.lastBotScore;
    const tied = team.lastTeamScore === team.lastBotScore;
    return `<div class="game-panel__heading"><div><span>ДУЭЛЬ С ИИ</span><h3>Финальный свисток</h3></div><p>Итог за сегодня сохранён в этом браузере. Завтра откроется новый матчдей.</p></div><div class="duel-result"><div><small>${escapeHtml(team.name)}</small><b>${team.lastTeamScore}</b></div><strong>:</strong><div><small>Тактик / ИИ</small><b>${team.lastBotScore}</b></div></div><div class="duel-verdict ${won ? 'is-win' : tied ? 'is-draw' : 'is-loss'}"><b>${won ? 'ТАКТИКА СРАБОТАЛА' : tied ? 'НИЧЬЯ В ДУЭЛИ' : 'ЕСТЬ ЧТО УЛУЧШИТЬ'}</b><span>${won ? `Капитан ${escapeHtml(byId[team.captain].name)} помог обыграть ИИ.` : tied ? 'Силы оказались равны. Завтра можно рискнуть с другим капитаном.' : 'Проверь состав и капитана перед следующим матчдеем.'}</span></div>`;
  };
  const setupPanel = () => `<div class="game-panel__heading"><div><span>ПЕРВЫЙ ВХОД</span><h3>Назови свой клуб</h3></div><p>После создания ты получишь стартовую 11‑ку по схеме 1–3–4–3 и бюджет 100 млн. Данные останутся в этом браузере.</p></div><form class="game-create" data-game-create><label for="game-club-name">Название клуба</label><div><input id="game-club-name" name="clubName" minlength="2" maxlength="18" required autocomplete="off" placeholder="Например, Северяне" /><button class="game-action" type="submit">Создать клуб</button></div><small>От 2 до 18 символов. Регистрация не требуется.</small></form>`;
  const renderPanel = () => {
    if (!browserTeam) {
      gamePanel.innerHTML = setupPanel();
      return;
    }
    gamePanel.innerHTML = activeGameTab === 'transfers' ? transferPanel(browserTeam) : activeGameTab === 'duel' ? duelPanel(browserTeam) : lineupPanel(browserTeam);
  };
  const renderGame = () => {
    renderStatus();
    renderField();
    renderPanel();
    gameTabs.forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.gameTab === activeGameTab);
      tab.disabled = !browserTeam;
    });
    resetGame.hidden = !browserTeam;
  };
  const setCaptain = (id) => {
    if (!browserTeam || !browserTeam.roster.includes(id)) return;
    updateTeam({ ...browserTeam, captain: id }, `${byId[id].name} теперь капитан ×2.`);
  };
  const makeTransfer = (incomingId) => {
    if (!browserTeam || !selectedOutgoing || !browserTeam.roster.includes(selectedOutgoing)) return;
    const outgoing = byId[selectedOutgoing];
    const incoming = byId[incomingId];
    if (!incoming || incoming.position !== outgoing.position || browserTeam.roster.includes(incomingId)) return;
    if (teamCost(browserTeam) - outgoing.price + incoming.price > browserTeam.budget) return;
    const nextRoster = browserTeam.roster.map((id) => id === selectedOutgoing ? incomingId : id);
    const nextTeam = {
      ...browserTeam,
      roster: nextRoster,
      captain: browserTeam.captain === selectedOutgoing ? incomingId : browserTeam.captain,
      transfers: browserTeam.transfers + 1
    };
    selectedOutgoing = null;
    activeGameTab = 'lineup';
    updateTeam(nextTeam, `${incoming.name} вошёл в состав вместо ${outgoing.name}.`);
  };
  const playDuel = () => {
    if (!browserTeam || browserTeam.lastPlayedDate === todayKey()) return;
    const daySeed = todayEpochDay();
    const rosterSeed = browserTeam.roster.reduce((sum, id) => sum + seedFrom(id), 0);
    const teamScore = 45 + positiveMod(rosterSeed + daySeed * 17, 31) + positiveMod(seedFrom(browserTeam.captain), 7);
    const botScore = 43 + positiveMod(daySeed * 23 + 19, 35);
    activeGameTab = 'duel';
    updateTeam({ ...browserTeam, totalPoints: browserTeam.totalPoints + teamScore, tours: browserTeam.tours + 1, lastPlayedDate: todayKey(), lastTeamScore: teamScore, lastBotScore: botScore });
  };
  gameRoot.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-game-tab]');
    if (tab && browserTeam) {
      activeGameTab = tab.dataset.gameTab;
      gameNotice = '';
      renderGame();
      return;
    }
    const action = event.target.closest('[data-game-action]');
    if (!action) return;
    if (action.dataset.gameAction === 'captain') setCaptain(action.dataset.player);
    if (action.dataset.gameAction === 'transfer') {
      selectedOutgoing = action.dataset.player;
      activeGameTab = 'transfers';
      gameNotice = '';
      renderGame();
    }
    if (action.dataset.gameAction === 'confirm-transfer') makeTransfer(action.dataset.player);
    if (action.dataset.gameAction === 'open-lineup') {
      activeGameTab = 'lineup';
      gameNotice = '';
      renderGame();
    }
    if (action.dataset.gameAction === 'play-duel') playDuel();
  });
  gameRoot.addEventListener('submit', (event) => {
    if (!event.target.matches('[data-game-create]')) return;
    event.preventDefault();
    const name = new FormData(event.target).get('clubName').trim();
    if (name.length < 2 || name.length > 18) return;
    activeGameTab = 'lineup';
    selectedOutgoing = null;
    updateTeam(newTeam(name), `Клуб «${name}» создан. Теперь назначь капитана.`);
  });
  resetGame.addEventListener('click', () => {
    if (!window.confirm('Удалить веб-прогресс TUR11 из этого браузера и начать заново?')) return;
    clearSavedTeam();
    browserTeam = null;
    activeGameTab = 'lineup';
    selectedOutgoing = null;
    gameNotice = '';
    renderGame();
  });
  renderGame();

  const partnersDialog = $('[data-partners-dialog]');
  const showcaseDialog = $('[data-showcase-dialog]');
  const ageCheckbox = $('[data-partners-age]');
  const enterShowcase = $('[data-enter-showcase]');

  $('[data-open-partners]').addEventListener('click', () => partnersDialog.showModal());
  ageCheckbox.addEventListener('change', () => { enterShowcase.disabled = !ageCheckbox.checked; });
  enterShowcase.addEventListener('click', () => {
    if (!ageCheckbox.checked) return;
    partnersDialog.close();
    showcaseDialog.showModal();
  });

})();
