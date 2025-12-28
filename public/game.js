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
const chatInput = document.getElementById('chat-input');
const sendChat = document.getElementById('send-chat');
const diceValues = document.querySelectorAll('.dice-panel .dice');
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

let notificationTimeout;

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

const renderPlayersList = (room) => {
  if (!playersList) {
    return;
  }
  playersList.innerHTML = '';
  if (!room) {
    return;
  }
  const userMap = new Map(state.users.map((user) => [user.id, user]));
  room.players.forEach((playerId, index) => {
    const player = userMap.get(playerId);
    const item = document.createElement('li');
    if (index === 0) {
      item.classList.add('active');
    }
    item.textContent = player ? `${player.name} · ${player.rating}` : 'Неизвестный игрок';
    playersList.appendChild(item);
  });
  for (let i = room.players.length; i < room.maxPlayers; i += 1) {
    const item = document.createElement('li');
    item.textContent = 'Свободный слот';
    playersList.appendChild(item);
  }
};

const openGameOverlay = (context = {}) => {
  if (!gameOverlay) {
    return;
  }
  gameOverlay.classList.add('active');
  gameOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('game-active');
  if (context.title && gameTitle) {
    gameTitle.textContent = context.title;
  }
  if (context.mode && gameMeta) {
    gameMeta.textContent = context.mode;
  }
  if (context.players) {
    renderPlayersList(context.players);
  }
  if (context.events) {
    setMatchEvents(context.events);
  }
  if (context.event) {
    addMatchEvent(context.event);
  }
  showNotification(context.notice || 'Матч открыт. Подготовка к игре.');
};

const closeGameOverlay = () => {
  if (!gameOverlay) {
    return;
  }
  gameOverlay.classList.remove('active');
  gameOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('game-active');
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
    meta.textContent = `${room.players.length}/${room.maxPlayers} игроков · режим ${room.mode} · ${betLabel} · ${room.privacy}`;
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
    players: room,
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
  const room = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    hostId: user.id,
    players: [user.id],
    maxPlayers,
    mode: roomModeInput.value,
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
    players: room,
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
    showNotification('Неверный логин или пароль.');
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
  const exists = state.users.some(
    (user) => user.name.toLowerCase() === name.toLowerCase() || user.email === email,
  );
  if (exists) {
    showNotification('Пользователь с таким именем или email уже существует.');
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
    if (!diceValues.length) {
      return;
    }
    rollDiceButton.disabled = true;
    const values = Array.from(diceValues).map(() => Math.ceil(Math.random() * 6));
    diceValues.forEach((die, index) => {
      die.textContent = values[index];
    });
    const user = getCurrentUser();
    addMatchEvent(`${user ? user.name : 'Игрок'} бросил кубики: ${values.join(' и ')}`);
    showNotification(`Бросок выполнен: ${values.join(' и ')}.`);
    setTimeout(() => {
      rollDiceButton.disabled = false;
    }, 1200);
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

updateOnlineCount();
updateProfile();
renderRooms();
if (!getCurrentUser()) {
  openAuthOverlay();
}
