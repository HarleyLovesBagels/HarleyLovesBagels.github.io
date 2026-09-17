const grid = document.querySelector("#repo-grid");
const year = document.querySelector("#year");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const gameArea = document.querySelector("#game-area");
const scoreDisplay = document.querySelector("#score");
const timeDisplay = document.querySelector("#time");
const startButton = document.querySelector("#start-game");
const gameOverlay = document.querySelector(".game-overlay");

if (year) year.textContent = new Date().getFullYear();

window.addEventListener("pointermove", (event) => {
  const { clientX, clientY } = event;
  cursorDot.style.left = `${clientX}px`;
  cursorDot.style.top = `${clientY}px`;
  cursorRing.style.left = `${clientX}px`;
  cursorRing.style.top = `${clientY}px`;
});

document.querySelectorAll("a, button").forEach((element) => {
  element.addEventListener("mouseenter", () => cursorRing.classList.add("active"));
  element.addEventListener("mouseleave", () => cursorRing.classList.remove("active"));
});

const pinned = ["Calculator", "RandomGenerator", "Hangman", "RockPaperScissors", "BrokenCode-Examples"];

function card(repo) {
  const description = repo.description || "A project by Harley Jones.";
  const language = repo.language || "Code";
  const stars = repo.stargazers_count || 0;
  return `<article class="repo">
    <h3>${escapeHtml(repo.name)}</h3>
    <p>${escapeHtml(description)}</p>
    <div class="meta"><span>${escapeHtml(language)}</span><span>★ ${stars}</span></div>
    <a class="repo-link" href="${repo.html_url}" target="_blank" rel="noreferrer">View repository ↗</a>
  </article>`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
async function loadRepos() {
  if (!grid) return;

  try {
    const res = await fetch("https://api.github.com/users/HarleyLovesBagels/repos?sort=updated&per_page=100");
    if (!res.ok) throw new Error("GitHub API error");
    const repos = await res.json();
    repos.sort((a,b) => {
      const ai = pinned.indexOf(a.name), bi = pinned.indexOf(b.name);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    grid.innerHTML = repos.slice(0, 6).map(card).join("");
  } catch {
    grid.innerHTML = `<article class="repo"><h3>GitHub</h3><p>Projects are available on my GitHub profile.</p><a class="repo-link" href="https://github.com/HarleyLovesBagels" target="_blank" rel="noreferrer">Open GitHub ↗</a></article>`;
  }
}

let score = 0;
let timeLeft = 20;
let gameTimer = null;
let spawnTimer = null;
let gameRunning = false;

function updateScore() {
  if (scoreDisplay) scoreDisplay.textContent = String(score);
}

function updateTime() {
  if (timeDisplay) timeDisplay.textContent = String(timeLeft);
}

function clearBagels() {
  if (!gameArea) return;
  gameArea.querySelectorAll(".bagel").forEach((bagel) => bagel.remove());
}

function endGame() {
  gameRunning = false;
  clearInterval(gameTimer);
  clearInterval(spawnTimer);
  if (gameOverlay) {
    gameOverlay.innerHTML = `<h3>Round over</h3><p>You caught ${score} bagel${score === 1 ? "" : "s"}. Hit start to play again.</p>`;
    gameOverlay.style.pointerEvents = "none";
  }
  if (startButton) startButton.textContent = "Play again";
}

function spawnBagel() {
  if (!gameArea || !gameRunning) return;

  const bagel = document.createElement("button");
  bagel.type = "button";
  bagel.className = "bagel";
  bagel.setAttribute("aria-label", "Catch bagel");
  bagel.textContent = "🥯";

  const maxX = gameArea.clientWidth - 52;
  const x = Math.max(0, Math.random() * maxX);
  bagel.style.left = `${x}px`;
  bagel.style.setProperty("--drift", `${(Math.random() * 30 - 15).toFixed(1)}px`);

  bagel.addEventListener("click", () => {
    if (!gameRunning) return;
    score += 1;
    updateScore();
    bagel.classList.add("missed");
    bagel.disabled = true;
    bagel.textContent = "✨";
    setTimeout(() => bagel.remove(), 150);
  });

  gameArea.appendChild(bagel);

  setTimeout(() => {
    if (bagel && bagel.isConnected && gameRunning) {
      bagel.classList.add("missed");
      setTimeout(() => bagel.remove(), 180);
    }
  }, 1800);
}

function startGame() {
  if (!gameArea) return;

  score = 0;
  timeLeft = 20;
  updateScore();
  updateTime();

  gameRunning = true;
  clearBagels();

  if (gameOverlay) {
    gameOverlay.innerHTML = `<h3>Catch the bagels</h3><p>Click every floating bagel before the timer runs out.</p>`;
    gameOverlay.style.pointerEvents = "none";
  }

  if (startButton) startButton.textContent = "Restart";

  spawnTimer = setInterval(spawnBagel, 500);
  gameTimer = setInterval(() => {
    timeLeft -= 1;
    updateTime();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

if (startButton) startButton.addEventListener("click", startGame);

loadRepos();
