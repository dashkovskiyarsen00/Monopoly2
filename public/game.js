const tabs = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.tab-panel');
const gameOverlay = document.getElementById('game-overlay');
const openGame = document.getElementById('open-game');
const quickJoin = document.getElementById('quick-join');
const createRoom = document.getElementById('create-room');
const exitGame = document.getElementById('exit-game');
const notification = document.getElementById('notification');
const openHelp = document.getElementById('open-help');
const switchAccount = document.getElementById('switch-account');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchEmpty = document.getElementById('search-empty');
const editProfile = document.getElementById('edit-profile');
const settingsInputs = document.querySelectorAll('[data-setting]');
const buyButtons = document.querySelectorAll('.buy-button');
const gameTitle = document.getElementById('game-title');
const gameMeta = document.getElementById('game-meta');
const matchEvents = document.getElementById('match-events');
const rollDiceButton = document.getElementById('roll-dice');
const surrenderButton = document.getElementById('surrender-game');
const chatInput = document.getElementById('chat-input');
const sendChat = document.getElementById('send-chat');
const diceValues = document.querySelectorAll('.dice-panel .dice');
const diceStatus = document.getElementById('dice-status');
const searchResults = document.getElementById('search-results');
const roomList = document.getElementById('room-list');
const roomEmpty = document.getElementById('room-empty');
const onlineCount = document.getElementById('online-count');
const playersList = document.getElementById('players-list');
const profileName = document.getElementById('profile-name');
const profileRank = document.getElementById('profile-rank');
const profileClan = document.getElementById('profile-clan');
const roomModal = document.getElementById('room-modal');
const closeRoomModalButton = document.getElementById('close-room-modal');
const roomForm = document.getElementById('room-form');
const roomNameInput = document.getElementById('room-name');
const roomPlayersInput = document.getElementById('room-players');
const roomModeInput = document.getElementById('room-mode');
const roomThemeInput = document.getElementById('room-theme');
const roomBetInput = document.getElementById('room-bet');
const roomPrivacyInput = document.getElementById('room-privacy');
const authOverlay = document.getElementById('auth-overlay');
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginIdentity = document.getElementById('login-identity');
const loginPassword = document.getElementById('login-password');
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const boardTiles = document.querySelectorAll('.board .tile');

let notificationTimeout;
let gameState = null;

const BOARD_THEME_CLASSES = ['theme-classic', 'theme-dota'];

const STORAGE_KEYS = {
  users: 'monopolyUsers',
  rooms: 'monopolyRooms',
  currentUser: 'monopolyCurrentUser',
};

const loadFromStorage = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const state = {
  users: loadFromStorage(STORAGE_KEYS.users, []),
  rooms: loadFromStorage(STORAGE_KEYS.rooms, []),
  currentUserId: loadFromStorage(STORAGE_KEYS.currentUser, null),
};

const PLAYER_COLORS = ['#5bd38d', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#f97316'];
const START_BONUS = 200;
const INITIAL_CASH = 1500;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const activateTab = (tabId) => {
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabId);
  });
  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });
};

const showNotification = (message) => {
  if (!notification) {
    return;
  }
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notification.textContent = message;
  notification.classList.add('visible');
  notificationTimeout = setTimeout(() => {
    notification.classList.remove('visible');
  }, 2600);
};

const getCurrentUser = () => state.users.find((user) => user.id === state.currentUserId) || null;

const setCurrentUser = (user) => {
  state.currentUserId = user ? user.id : null;
  saveToStorage(STORAGE_KEYS.currentUser, state.currentUserId);
};

const syncStorage = () => {
  saveToStorage(STORAGE_KEYS.users, state.users);
  saveToStorage(STORAGE_KEYS.rooms, state.rooms);
};

const openAuthOverlay = () => {
  if (!authOverlay) {
    return;
  }
  authOverlay.classList.add('active');
  authOverlay.setAttribute('aria-hidden', 'false');
};

const closeAuthOverlay = () => {
  if (!authOverlay) {
    return;
  }
  authOverlay.classList.remove('active');
  authOverlay.setAttribute('aria-hidden', 'true');
};

const openRoomModal = () => {
  if (!roomModal) {
    return;
  }
  roomModal.classList.add('active');
  roomModal.setAttribute('aria-hidden', 'false');
};

const closeRoomModal = () => {
  if (!roomModal) {
    return;
  }
  roomModal.classList.remove('active');
  roomModal.setAttribute('aria-hidden', 'true');
};

const setBoardTheme = (theme) => {
  if (!gameOverlay) {
    return;
  }
  const normalized = theme === 'classic' ? 'classic' : 'dota';
  gameOverlay.classList.remove(...BOARD_THEME_CLASSES);
  gameOverlay.classList.add(normalized === 'classic' ? 'theme-classic' : 'theme-dota');
};

const updateOnlineCount = () => {
  if (onlineCount) {
    onlineCount.textContent = String(state.users.length);
  }
};

const updateProfile = () => {
  const user = getCurrentUser();
  if (!user) {
    if (profileName) {
      profileName.textContent = 'Гость';
    }
    if (profileRank) {
      profileRank.textContent = 'Новичок';
    }
    if (profileClan) {
      profileClan.textContent = 'Без клана';
    }
    return;
  }
  if (profileName) {
    profileName.textContent = user.name;
  }
  if (profileRank) {
    profileRank.textContent = user.rank;
  }
  if (profileClan) {
    profileClan.textContent = user.clan;
  }
};

const prepareBoardTiles = () => {
  if (!boardTiles.length) {
    return;
  }
  boardTiles.forEach((tile) => {
    const label = tile.textContent.trim();
    const brand = tile.dataset.brand;
    if (brand) {
      const brandText = tile.dataset.brandText || label;
      const brandLogoMarkup =
        brand === 'invicta'
          ? '<img class="brand-logo brand-invicta" src="/invicta-logo.png" alt="" aria-label="INVICTA">'
          : `<span class="brand-logo brand-${brand}">${brandText}</span>`;
      tile.innerHTML = `<span class="tile-label tile-label--brand">${brandLogoMarkup}</span><div class="tile-tokens"></div>`;
      return;
    }
    tile.innerHTML = `<span class="tile-label">${label}</span><div class="tile-tokens"></div>`;
  });
};

const getOrderedTiles = () =>
  Array.from(boardTiles).sort(
    (a, b) => Number(a.dataset.index || 0) - Number(b.dataset.index || 0),
  );

const clearActiveTiles = () => {
  boardTiles.forEach((tile) => tile.classList.remove('active-turn'));
};

const addMatchEvent = (message) => {
  if (!matchEvents) {
    return;
  }
  const item = document.createElement('li');
  item.textContent = message;
  matchEvents.prepend(item);
  const maxItems = 6;
  while (matchEvents.children.length > maxItems) {
    matchEvents.removeChild(matchEvents.lastElementChild);
  }
};

const setMatchEvents = (events = []) => {
  if (!matchEvents) {
    return;
  }
  matchEvents.innerHTML = '';
  events.forEach((event) => addMatchEvent(event));
};

const renderPlayersList = () => {
  if (!playersList) {
    return;
  }
  playersList.innerHTML = '';
  if (!gameState) {
    return;
  }
  gameState.players.forEach((player, index) => {
    const item = document.createElement('li');
    if (index === gameState.currentTurn) {
      item.classList.add('active');
    }
    if (player.bankrupt) {
      item.classList.add('bankrupt');
    }
    const name = document.createElement('span');
    name.className = 'player-name';
    const dot = document.createElement('span');
    dot.className = 'player-dot';
    dot.style.background = player.color;
    const label = document.createElement('span');
    label.textContent = player.name;
    name.appendChild(dot);
    name.appendChild(label);
    const cash = document.createElement('span');
    cash.className = 'player-cash';
    cash.textContent = `💰 ${player.cash}`;
    item.appendChild(name);
    item.appendChild(cash);
    playersList.appendChild(item);
  });
  if (gameState.maxPlayers && gameState.players.length < gameState.maxPlayers) {
    for (let i = gameState.players.length; i < gameState.maxPlayers; i += 1) {
      const item = document.createElement('li');
      item.textContent = 'Свободный слот';
      playersList.appendChild(item);
    }
  }
};

const updateGameMeta = () => {
  if (!gameState || !gameMeta) {
    return;
  }
  const currentPlayer = gameState.players[gameState.currentTurn];
  const roundLabel = `Раунд ${gameState.round}`;
  gameMeta.textContent = `${roundLabel} · Ход игрока: ${currentPlayer.name}`;
  if (diceStatus) {
    diceStatus.textContent = gameState.isBusy
      ? 'Выполняется ход...'
      : currentPlayer.isHuman
        ? 'Ваш ход — бросайте кубики'
        : `Ход игрока ${currentPlayer.name}`;
  }
};

const placeToken = (player, position) => {
  const tiles = getOrderedTiles();
  const tile = tiles[position];
  if (!tile || !player.token) {
    return;
  }
  const container = tile.querySelector('.tile-tokens');
  if (!container) {
    return;
  }
  container.appendChild(player.token);
};

const highlightActiveTile = () => {
  if (!gameState) {
    return;
  }
  clearActiveTiles();
  const tiles = getOrderedTiles();
  const activePlayer = gameState.players[gameState.currentTurn];
  const tile = tiles[activePlayer.position];
  if (tile) {
    tile.classList.add('active-turn');
  }
};

const updateTokens = () => {
  if (!boardTiles.length) {
    return;
  }
  boardTiles.forEach((tile) => {
    const container = tile.querySelector('.tile-tokens');
    if (container) {
      container.innerHTML = '';
    }
  });
  clearActiveTiles();
  if (!gameState) {
    return;
  }
  gameState.players.forEach((player) => {
    placeToken(player, player.position);
  });
  highlightActiveTile();
};

const buildPlayers = (room) => {
  const currentUser = getCurrentUser();
  const basePlayers = [];
  const userMap = new Map(state.users.map((user) => [user.id, user]));
  if (room?.players?.length) {
    room.players.forEach((playerId, index) => {
      const user = userMap.get(playerId);
      basePlayers.push({
        id: playerId,
        name: user ? user.name : `Игрок ${index + 1}`,
        color: PLAYER_COLORS[index % PLAYER_COLORS.length],
        cash: INITIAL_CASH,
        position: 0,
        isHuman: Boolean(currentUser && user && user.id === currentUser.id),
      });
    });
  }
  if (basePlayers.length === 0) {
    const guestName = currentUser ? currentUser.name : 'Гость';
    basePlayers.push({
      id: currentUser ? currentUser.id : 'guest',
      name: guestName,
      color: PLAYER_COLORS[0],
      cash: INITIAL_CASH,
      position: 0,
      isHuman: true,
    });
  }
  const targetPlayers = Math.max(room?.maxPlayers || 4, 2);
  while (basePlayers.length < Math.min(targetPlayers, 4)) {
    const index = basePlayers.length;
    basePlayers.push({
      id: `bot-${index}`,
      name: `Бот ${index}`,
      color: PLAYER_COLORS[index % PLAYER_COLORS.length],
      cash: INITIAL_CASH,
      position: 0,
      isHuman: false,
    });
  }
  basePlayers.forEach((player) => {
    const token = document.createElement('div');
    token.className = 'player-token';
    token.style.background = player.color;
    player.token = token;
  });
  return basePlayers;
};

const initializeGame = (room) => {
  gameState = {
    players: buildPlayers(room),
    currentTurn: 0,
    round: 1,
    isBusy: false,
    maxPlayers: room?.maxPlayers || 4,
    roomId: room?.id || null,
    theme: room?.theme || 'dota',
  };
  updateTokens();
  renderPlayersList();
  updateGameMeta();
  const currentPlayer = gameState.players[gameState.currentTurn];
  if (rollDiceButton) {
    rollDiceButton.disabled = !currentPlayer.isHuman;
  }
  if (!currentPlayer.isHuman) {
    setTimeout(() => handleAutoTurn(), 1200);
  }
};

const handleSurrender = () => {
  if (!gameState || gameState.isBusy) {
    return;
  }
  const playerIndex = gameState.players.findIndex((player) => player.isHuman && !player.bankrupt);
  if (playerIndex === -1) {
    return;
  }
  const player = gameState.players[playerIndex];
  player.cash = 0;
  player.bankrupt = true;
  addMatchEvent(`${player.name} сдался и покинул матч.`);
  renderPlayersList();
  updateTokens();
  if (finalizeGameIfNeeded()) {
    return;
  }
  if (playerIndex === gameState.currentTurn) {
    endTurn();
  } else {
    updateGameMeta();
  }
};

const applyTileEffect = (player, tile) => {
  if (!tile) {
    return;
  }
  let delta = 0;
  if (tile.classList.contains('tax')) {
    delta = -150;
    addMatchEvent(`${player.name} оплатил штраф ${Math.abs(delta)}.`);
  } else if (tile.classList.contains('chance')) {
    delta = Math.random() > 0.5 ? 120 : -80;
    addMatchEvent(
      delta >= 0
        ? `${player.name} получил бонус ${delta} за руну.`
        : `${player.name} потерял ${Math.abs(delta)} из-за руны.`,
    );
  } else if (tile.classList.contains('utility')) {
    delta = 75;
    addMatchEvent(`${player.name} получил ${delta} за объект поддержки.`);
  } else if (tile.classList.contains('transport')) {
    delta = 120;
    addMatchEvent(`${player.name} заработал ${delta} на транспортной точке.`);
  } else if (tile.classList.contains('property')) {
    delta = -100;
    addMatchEvent(`${player.name} инвестировал ${Math.abs(delta)} в собственность.`);
  }
  if (delta !== 0) {
    player.cash = Math.max(0, player.cash + delta);
  }
};

const closeRoomById = (roomId) => {
  if (!roomId) {
    return;
  }
  const index = state.rooms.findIndex((room) => room.id === roomId);
  if (index === -1) {
    return;
  }
  state.rooms.splice(index, 1);
  syncStorage();
  renderRooms();
};

const checkBankrupt = (player) => {
  if (player.cash > 0 || player.bankrupt) {
    return false;
  }
  player.bankrupt = true;
  addMatchEvent(`${player.name} банкрот и выбывает из игры.`);
  return true;
};

const movePlayer = async (player, steps) => {
  const tiles = getOrderedTiles();
  const totalTiles = tiles.length;
  player.token?.classList.add('moving');
  for (let i = 0; i < steps; i += 1) {
    await delay(320);
    player.position = (player.position + 1) % totalTiles;
    if (player.position === 0) {
      player.cash += START_BONUS;
      addMatchEvent(`${player.name} прошёл старт и получил ${START_BONUS}.`);
    }
    updateTokens();
  }
  player.token?.classList.remove('moving');
  const tile = tiles[player.position];
  applyTileEffect(player, tile);
  checkBankrupt(player);
  renderPlayersList();
};

const getNextActiveTurn = () => {
  if (!gameState) {
    return 0;
  }
  const activePlayers = gameState.players.filter((player) => !player.bankrupt);
  if (activePlayers.length <= 1) {
    return null;
  }
  let nextIndex = gameState.currentTurn;
  let safety = 0;
  do {
    nextIndex = (nextIndex + 1) % gameState.players.length;
    safety += 1;
  } while (gameState.players[nextIndex].bankrupt && safety < gameState.players.length);
  return nextIndex;
};

const finalizeGameIfNeeded = () => {
  if (!gameState) {
    return false;
  }
  const activePlayers = gameState.players.filter((player) => !player.bankrupt);
  if (activePlayers.length <= 1) {
    const winner = activePlayers[0];
    addMatchEvent(winner ? `${winner.name} победил в матче!` : 'Матч завершён.');
    if (diceStatus) {
      diceStatus.textContent = 'Матч завершён';
    }
    if (rollDiceButton) {
      rollDiceButton.disabled = true;
    }
    if (gameState.roomId) {
      closeRoomById(gameState.roomId);
      gameState.roomId = null;
    }
    return true;
  }
  return false;
};

const endTurn = () => {
  if (!gameState) {
    return;
  }
  const nextIndex = getNextActiveTurn();
  if (nextIndex === null) {
    finalizeGameIfNeeded();
    return;
  }
  if (nextIndex === 0) {
    gameState.round += 1;
  }
  gameState.currentTurn = nextIndex;
  renderPlayersList();
  updateGameMeta();
  highlightActiveTile();
  if (rollDiceButton) {
    const activePlayer = gameState.players[gameState.currentTurn];
    rollDiceButton.disabled = !activePlayer.isHuman;
  }
  const activePlayer = gameState.players[gameState.currentTurn];
  if (!activePlayer.isHuman) {
    setTimeout(() => handleAutoTurn(), 1100);
  }
};

const performRoll = async (player) => {
  if (!diceValues.length || !gameState || gameState.isBusy) {
    return;
  }
  gameState.isBusy = true;
  if (rollDiceButton) {
    rollDiceButton.disabled = true;
  }
  if (diceStatus) {
    diceStatus.textContent = 'Бросок кубиков...';
  }
  diceValues.forEach((die) => die.classList.add('rolling'));
  await delay(600);
  const values = Array.from(diceValues).map(() => Math.ceil(Math.random() * 6));
  diceValues.forEach((die, index) => {
    die.textContent = values[index];
    die.classList.remove('rolling');
  });
  const total = values.reduce((sum, value) => sum + value, 0);
  addMatchEvent(`${player.name} бросил кубики: ${values.join(' и ')}.`);
  await movePlayer(player, total);
  gameState.isBusy = false;
  if (!finalizeGameIfNeeded()) {
    endTurn();
  }
};

const handleAutoTurn = () => {
  if (!gameState) {
    return;
  }
  const player = gameState.players[gameState.currentTurn];
  if (player.isHuman) {
    return;
  }
  performRoll(player);
};

const openGameOverlay = (context = {}) => {
  if (!gameOverlay) {
    return;
  }
  gameOverlay.classList.add('active');
  gameOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('game-active');
  setBoardTheme(context.theme || context.room?.theme || gameState?.theme || 'dota');
  if (context.title && gameTitle) {
    gameTitle.textContent = context.title;
  }
  if (context.mode && gameMeta) {
    gameMeta.textContent = context.mode;
  }
  if (context.events) {
    setMatchEvents(context.events);
  }
  if (context.event) {
    addMatchEvent(context.event);
  }
  if (context.room) {
    initializeGame(context.room);
  } else if (!gameState) {
    initializeGame();
  }
  if (!context.events && !context.event) {
    addMatchEvent('Матч готов. Бросайте кубики.');
  }
  showNotification(context.notice || 'Матч открыт. Подготовка к игре.');
};

const closeGameOverlay = () => {
  if (!gameOverlay) {
    return;
  }
  if (gameState?.roomId) {
    closeRoomById(gameState.roomId);
  }
  gameOverlay.classList.remove('active');
  gameOverlay.setAttribute('aria-hidden', 'true');
  gameOverlay.classList.remove(...BOARD_THEME_CLASSES);
  document.body.classList.remove('game-active');
  gameState = null;
  updateTokens();
  showNotification('Возвращаемся в лобби.');
};

const renderRooms = () => {
  if (!roomList) {
    return;
  }
  roomList.innerHTML = '';
  if (roomEmpty) {
    roomEmpty.style.display = state.rooms.length === 0 ? 'block' : 'none';
  }
  state.rooms.forEach((room) => {
    const item = document.createElement('li');
    const info = document.createElement('div');
    const title = document.createElement('strong');
    const meta = document.createElement('span');
    title.textContent = room.name;
    const betLabel = room.bet > 0 ? `ставка ${room.bet}` : 'без ставки';
    const themeLabel = room.theme === 'classic' ? 'классическая' : 'dota';
    meta.textContent = `${room.players.length}/${room.maxPlayers} игроков · режим ${room.mode} · тема ${themeLabel} · ${betLabel} · ${room.privacy}`;
    info.appendChild(title);
    info.appendChild(meta);
    const joinButton = document.createElement('button');
    joinButton.className = 'ghost join-room';
    joinButton.textContent = 'Войти';
    joinButton.addEventListener('click', () => joinRoom(room.id));
    item.appendChild(info);
    item.appendChild(joinButton);
    roomList.appendChild(item);
  });
};

const joinRoom = (roomId) => {
  const user = getCurrentUser();
  if (!user) {
    openAuthOverlay();
    return;
  }
  const room = state.rooms.find((entry) => entry.id === roomId);
  if (!room) {
    showNotification('Комната не найдена.');
    return;
  }
  if (!room.players.includes(user.id)) {
    if (room.players.length >= room.maxPlayers) {
      showNotification('Комната заполнена. Выберите другую.');
      return;
    }
    room.players.push(user.id);
    syncStorage();
    renderRooms();
  }
  const playersLabel = `${room.players.length}/${room.maxPlayers} игроков`;
  openGameOverlay({
    title: `Комната: ${room.name}`,
    mode: `Режим: ${room.mode} · ${playersLabel}`,
    room,
    events: [`${user.name} присоединился к комнате.`],
    notice: `Подключение к комнате «${room.name}».`,
  });
};

const handleQuickJoin = () => {
  const user = getCurrentUser();
  if (!user) {
    openAuthOverlay();
    return;
  }
  const availableRoom = state.rooms.find((room) => room.players.length < room.maxPlayers);
  if (!availableRoom) {
    showNotification('Нет свободных комнат. Создайте новую.');
    return;
  }
  joinRoom(availableRoom.id);
};

const renderSearchResults = (query) => {
  if (!searchResults || !searchEmpty) {
    return;
  }
  const normalized = query.trim().toLowerCase();
  searchResults.innerHTML = '';
  if (!normalized) {
    searchEmpty.classList.remove('visible');
    return;
  }
  const currentUser = getCurrentUser();
  const matches = state.users.filter((user) => {
    if (currentUser && user.id === currentUser.id) {
      return false;
    }
    return user.name.toLowerCase().includes(normalized) || user.email.toLowerCase().includes(normalized);
  });
  if (matches.length === 0) {
    searchEmpty.classList.add('visible');
    return;
  }
  searchEmpty.classList.remove('visible');
  matches.forEach((user) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    const name = document.createElement('span');
    name.textContent = user.name;
    const button = document.createElement('button');
    button.className = 'ghost add-friend';
    button.textContent = 'Добавить';
    button.addEventListener('click', () => {
      button.classList.toggle('added');
      const added = button.classList.contains('added');
      button.textContent = added ? 'Добавлено' : 'Добавить';
      showNotification(added ? 'Игрок добавлен в друзья.' : 'Игрок удален из друзей.');
    });
    card.appendChild(name);
    card.appendChild(button);
    searchResults.appendChild(card);
  });
  showNotification(`Результатов найдено: ${matches.length}`);
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    openAuthOverlay();
    return;
  }
  const name = roomNameInput.value.trim();
  if (!name) {
    showNotification('Введите название комнаты.');
    return;
  }
  const maxPlayers = Number(roomPlayersInput.value);
  const bet = Number(roomBetInput.value || 0);
  const theme = roomThemeInput?.value === 'classic' ? 'classic' : 'dota';
  const room = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    hostId: user.id,
    players: [user.id],
    maxPlayers,
    mode: roomModeInput.value,
    theme,
    bet,
    privacy: roomPrivacyInput.value,
    createdAt: new Date().toISOString(),
  };
  state.rooms.unshift(room);
  syncStorage();
  renderRooms();
  closeRoomModal();
  roomForm.reset();
  openGameOverlay({
    title: `Комната: ${room.name}`,
    mode: `Режим: ${room.mode} · 1/${room.maxPlayers} игроков`,
    room,
    events: [`${user.name} создал комнату.`],
    notice: 'Комната создана и ожидает игроков.',
  });
};

const handleLogin = (event) => {
  event.preventDefault();
  const identity = loginIdentity.value.trim().toLowerCase();
  const password = loginPassword.value;
  const user = state.users.find(
    (entry) =>
      (entry.name.toLowerCase() === identity || entry.email.toLowerCase() === identity) &&
      entry.password === password,
  );
  if (!user) {
    showNotification('Неверный логин или пароль');
    return;
  }
  setCurrentUser(user);
  closeAuthOverlay();
  updateProfile();
  showNotification(`С возвращением, ${user.name}!`);
};

const handleRegister = (event) => {
  event.preventDefault();
  const name = registerName.value.trim();
  const email = registerEmail.value.trim().toLowerCase();
  const password = registerPassword.value;
  if (!name || !email || !password) {
    showNotification('Заполните все поля.');
    return;
  }
  const nameTaken = state.users.some((user) => user.name.toLowerCase() === name.toLowerCase());
  if (nameTaken) {
    showNotification('Логин уже занят');
    return;
  }
  const emailTaken = state.users.some((user) => user.email === email);
  if (emailTaken) {
    showNotification('Email уже занят.');
    return;
  }
  const newUser = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    email,
    password,
    rank: 'Новичок',
    clan: 'Без клана',
    rating: 1000,
  };
  state.users.push(newUser);
  setCurrentUser(newUser);
  syncStorage();
  updateOnlineCount();
  updateProfile();
  closeAuthOverlay();
  registerForm.reset();
  showNotification(`Аккаунт создан. Добро пожаловать, ${newUser.name}!`);
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

if (openGame) {
  openGame.addEventListener('click', openRoomModal);
}

if (createRoom) {
  createRoom.addEventListener('click', openRoomModal);
}

if (quickJoin) {
  quickJoin.addEventListener('click', handleQuickJoin);
}

if (exitGame) {
  exitGame.addEventListener('click', closeGameOverlay);
}

if (surrenderButton) {
  surrenderButton.addEventListener('click', handleSurrender);
}

if (openHelp) {
  openHelp.addEventListener('click', () => {
    activateTab('rules');
    showNotification('Открыт раздел с правилами.');
  });
}

if (switchAccount) {
  switchAccount.addEventListener('click', () => {
    setCurrentUser(null);
    openAuthOverlay();
    showNotification('Выберите аккаунт для продолжения.');
  });
}

if (searchButton) {
  searchButton.addEventListener('click', () => {
    renderSearchResults(searchInput?.value || '');
  });
}

if (searchInput) {
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      renderSearchResults(searchInput.value);
    }
  });
}

if (editProfile) {
  editProfile.addEventListener('click', () => {
    activateTab('settings');
    showNotification('Открыты настройки профиля.');
  });
}

settingsInputs.forEach((input) => {
  input.addEventListener('change', () => {
    const label = input.dataset.setting || 'Настройка';
    showNotification(`Сохранено: ${label}.`);
  });
});

buyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.classList.contains('purchased')) {
      return;
    }
    button.classList.add('purchased');
    button.textContent = 'Куплено';
    const item = button.dataset.item || 'Предмет';
    showNotification(`Покупка подтверждена: ${item}.`);
  });
});

if (rollDiceButton) {
  rollDiceButton.addEventListener('click', () => {
    if (!gameState) {
      initializeGame();
    }
    const currentPlayer = gameState.players[gameState.currentTurn];
    if (!currentPlayer.isHuman) {
      return;
    }
    performRoll(currentPlayer);
  });
}

const sendChatMessage = () => {
  const message = chatInput?.value.trim();
  if (!message) {
    showNotification('Введите сообщение перед отправкой.');
    return;
  }
  const messages = document.querySelector('.chat-messages');
  if (!messages) {
    return;
  }
  const user = getCurrentUser();
  const entry = document.createElement('p');
  entry.innerHTML = `<strong>${user ? user.name : 'Игрок'}:</strong> ${message}`;
  messages.appendChild(entry);
  messages.scrollTop = messages.scrollHeight;
  chatInput.value = '';
  showNotification('Сообщение отправлено.');
};

if (sendChat) {
  sendChat.addEventListener('click', sendChatMessage);
}

if (chatInput) {
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendChatMessage();
    }
  });
}

if (closeRoomModalButton) {
  closeRoomModalButton.addEventListener('click', closeRoomModal);
}

if (roomForm) {
  roomForm.addEventListener('submit', handleRoomSubmit);
}

authTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    authTabs.forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.authTab;
    if (loginForm && registerForm) {
      loginForm.classList.toggle('active', target === 'login');
      registerForm.classList.toggle('active', target === 'register');
    }
  });
});

if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
  registerForm.addEventListener('submit', handleRegister);
}

prepareBoardTiles();
updateOnlineCount();
updateProfile();
renderRooms();
if (!getCurrentUser()) {
  openAuthOverlay();
}
