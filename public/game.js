const tiles = [
  { name: "Старт", type: "corner" },
  { name: "Средиземноморье", color: "#955630" },
  { name: "Общий фонд", type: "event" },
  { name: "Балтийский", color: "#955630" },
  { name: "Подоходный налог", type: "tax" },
  { name: "Северный вокзал", type: "rail" },
  { name: "Вермонт", color: "#7ad3f7" },
  { name: "Шанс", type: "event" },
  { name: "Коннектикут", color: "#7ad3f7" },
  { name: "Сент-Чарльз", color: "#7ad3f7" },
  { name: "Тюрьма", type: "corner" },
  { name: "Сент-Джеймс", color: "#d889f3" },
  { name: "Электро", type: "utility" },
  { name: "Вирджиния", color: "#d889f3" },
  { name: "Стейт", color: "#d889f3" },
  { name: "Пенсильвания ЖД", type: "rail" },
  { name: "Сент-Джеймс Парк", color: "#f7a3c2" },
  { name: "Общий фонд", type: "event" },
  { name: "Теннесси", color: "#f7a3c2" },
  { name: "Нью-Йорк", color: "#f7a3c2" },
  { name: "Бесплатная стоянка", type: "corner" },
  { name: "Кентукки", color: "#f6a55a" },
  { name: "Шанс", type: "event" },
  { name: "Индиана", color: "#f6a55a" },
  { name: "Иллинойс", color: "#f6a55a" },
  { name: "B. & O. ЖД", type: "rail" },
  { name: "Атлантик", color: "#f05252" },
  { name: "Водоканал", type: "utility" },
  { name: "Вентнор", color: "#f05252" },
  { name: "Марвин Гарден", color: "#f05252" },
  { name: "Переход", type: "corner" },
  { name: "Пасифик", color: "#f4d03f" },
  { name: "Северная Каролина", color: "#f4d03f" },
  { name: "Общий фонд", type: "event" },
  { name: "Пенсильвания", color: "#f4d03f" },
  { name: "Короткая линия", type: "rail" },
  { name: "Шанс", type: "event" },
  { name: "Парк Плейс", color: "#3f6cf4" },
  { name: "Роскошный налог", type: "tax" },
  { name: "Бродвей", color: "#3f6cf4" }
];

const board = document.getElementById("board");
const tileInfo = document.getElementById("tile-info");

const layoutPositions = [
  110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100,
  89, 78, 67, 56, 45, 34, 23, 12, 1,
  11, 22, 33, 44, 55, 66, 77, 88, 99,
  90, 91, 92, 93, 94, 95, 96, 97, 98
];

const boardCells = Array.from({ length: 121 }, () => {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  board.appendChild(cell);
  return cell;
});

layoutPositions.forEach((position, index) => {
  const tile = tiles[index];
  const tileEl = document.createElement("div");
  tileEl.classList.add("tile");

  if (tile.type === "corner") {
    tileEl.classList.add("tile--corner");
  }

  if (tile.color) {
    const colorEl = document.createElement("div");
    colorEl.classList.add("tile__color");
    colorEl.style.background = tile.color;
    tileEl.appendChild(colorEl);
  }

  const title = document.createElement("div");
  title.classList.add("tile__title");
  title.textContent = tile.name;
  tileEl.appendChild(title);

  tileEl.addEventListener("click", () => {
    tileInfo.innerHTML = `
      <h3>${tile.name}</h3>
      <p>${tile.type === "event" ? "Случайная карта" : tile.type || "Участок"}</p>
    `;
  });

  boardCells[position].replaceWith(tileEl);
  boardCells[position] = tileEl;
});

const avatarPreview = document.getElementById("avatar-preview");
const avatarOptions = document.querySelectorAll(".avatar-option");

avatarOptions.forEach((button) => {
  button.addEventListener("click", () => {
    avatarPreview.textContent = button.dataset.avatar;
  });
});

const modal = document.getElementById("settings-modal");
const openSettings = document.getElementById("open-settings");

const toggleModal = (state) => {
  modal.setAttribute("aria-hidden", String(!state));
};

openSettings.addEventListener("click", () => toggleModal(true));
modal.addEventListener("click", (event) => {
  if (event.target.dataset.close !== undefined) {
    toggleModal(false);
  }
});

const createRoomButton = document.getElementById("create-room");
const lobbyList = document.getElementById("lobby-list");

createRoomButton.addEventListener("click", () => {
  const roomName = document.getElementById("room-name").value || "Новая комната";
  const mode = document.getElementById("room-mode").value;
  const card = document.createElement("div");
  card.classList.add("lobby-card");
  card.innerHTML = `
    <div>
      <h3>${roomName}</h3>
      <p>1/6 игроков • ${mode}</p>
    </div>
    <button class="btn btn--ghost">Войти</button>
  `;
  lobbyList.prepend(card);
});

const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

const sendMessage = () => {
  if (!chatInput.value.trim()) return;
  const message = document.createElement("p");
  message.innerHTML = `<strong>Вы:</strong> ${chatInput.value}`;
  chatMessages.appendChild(message);
  chatInput.value = "";
};

document.getElementById("send-message").addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
