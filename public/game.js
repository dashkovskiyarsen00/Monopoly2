const tabs = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.tab-panel');
const gameOverlay = document.getElementById('game-overlay');
const openGame = document.getElementById('open-game');
const quickJoin = document.getElementById('quick-join');
const createRoom = document.getElementById('create-room');
const joinButtons = document.querySelectorAll('.join-room');
const exitGame = document.getElementById('exit-game');

const activateTab = (tabId) => {
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabId);
  });
  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

const openGameOverlay = () => {
  gameOverlay.classList.add('active');
  gameOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('game-active');
};

const closeGameOverlay = () => {
  gameOverlay.classList.remove('active');
  gameOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('game-active');
};

[openGame, quickJoin, createRoom, ...joinButtons].forEach((button) => {
  if (button) {
    button.addEventListener('click', openGameOverlay);
  }
});

exitGame.addEventListener('click', closeGameOverlay);
