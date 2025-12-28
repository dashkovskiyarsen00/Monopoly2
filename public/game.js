const tabs = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.tab-panel');
const gameOverlay = document.getElementById('game-overlay');
const openGame = document.getElementById('open-game');
const quickJoin = document.getElementById('quick-join');
const createRoom = document.getElementById('create-room');
const joinButtons = document.querySelectorAll('.join-room');
const exitGame = document.getElementById('exit-game');
const notification = document.getElementById('notification');
const openHelp = document.getElementById('open-help');
const switchAccount = document.getElementById('switch-account');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchEmpty = document.getElementById('search-empty');
const addFriendButtons = document.querySelectorAll('.add-friend');
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
const searchResults = document.querySelectorAll('.search-results .result-card');

let notificationTimeout;

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

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

const openGameOverlay = (context = {}) => {
  gameOverlay.classList.add('active');
  gameOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('game-active');
  if (context.title && gameTitle) {
    gameTitle.textContent = context.title;
  }
  if (context.mode && gameMeta) {
    gameMeta.textContent = `${context.mode} · Ход игрока: ShadowBroker`;
  }
  if (context.event) {
    addMatchEvent(context.event);
  }
  showNotification(context.notice || 'Матч открыт. Подготовка к игре.');
};

const closeGameOverlay = () => {
  gameOverlay.classList.remove('active');
  gameOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('game-active');
  showNotification('Возвращаемся в лобби.');
};

const openGameButtons = [openGame, quickJoin, createRoom, ...joinButtons];

openGameButtons.forEach((button) => {
  if (button) {
    button.addEventListener('click', () => {
      const title = button.dataset.gameTitle || 'Матч: Тренировочный';
      const mode = button.dataset.gameMode || 'Подготовка матча';
      openGameOverlay({
        title,
        mode,
        event: `Инициировано действие: ${button.textContent.trim()}`,
        notice: `${mode}. ${title}`,
      });
    });
  }
});

exitGame.addEventListener('click', closeGameOverlay);

if (openHelp) {
  openHelp.addEventListener('click', () => {
    activateTab('rules');
    showNotification('Открыт раздел с правилами.');
  });
}

if (switchAccount) {
  switchAccount.addEventListener('click', () => {
    activateTab('profile');
    showNotification('Демо-аккаунт переключен. Проверьте профиль.');
  });
}

const filterSearchResults = () => {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  let visibleCount = 0;
  searchResults.forEach((card) => {
    const name = card.querySelector('span')?.textContent.toLowerCase() || '';
    const matches = query.length === 0 || name.includes(query);
    card.style.display = matches ? 'flex' : 'none';
    if (matches) {
      visibleCount += 1;
    }
  });
  if (searchEmpty) {
    searchEmpty.classList.toggle('visible', visibleCount === 0);
  }
  if (query.length > 0) {
    showNotification(`Результатов найдено: ${visibleCount}`);
  }
};

if (searchButton) {
  searchButton.addEventListener('click', filterSearchResults);
}

if (searchInput) {
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      filterSearchResults();
    }
  });
}

addFriendButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const isAdded = button.classList.toggle('added');
    button.textContent = isAdded ? 'Добавлено' : 'Добавить';
    showNotification(isAdded ? 'Игрок добавлен в друзья.' : 'Игрок удален из друзей.');
  });
});

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
    addMatchEvent(`ShadowBroker бросил кубики: ${values.join(' и ')}`);
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
  const entry = document.createElement('p');
  entry.innerHTML = `<strong>ShadowBroker:</strong> ${message}`;
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
