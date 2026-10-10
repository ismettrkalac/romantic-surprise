const $ = (selector) => document.querySelector(selector);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? Math.min(ms, 150) : ms));

const ticketStage = $("#ticket-stage");
const ticket = $("#ticket");
const theater = $("#theater");
const screen = $("#screen");
const screenCard = $("#screen-card");
const film = $("#film");
const countdown = $("#countdown");
const count = $("#count");
const screenPlay = $("#screen-play");
const screenMissing = $("#screen-missing");
const credits = $("#credits");
const song = $("#song");
const vinyl = $("#vinyl");

let filmStarted = false;
let filmMissing = false;
let songWanted = false;

/* ---------- srca koja lete ---------- */

if (!reducedMotion) {
  const hearts = $(".hearts");
  const colors = ["#f4b6c2", "#c23a54", "#e9c27b"];
  for (let i = 0; i < 14; i++) {
    const heart = document.createElement("span");
    heart.textContent = "♥︎";
    heart.style.setProperty("--x", `${Math.random() * 100}%`);
    heart.style.setProperty("--s", `${10 + Math.random() * 16}px`);
    heart.style.setProperty("--d", `${10 + Math.random() * 9}s`);
    heart.style.setProperty("--delay", `${-Math.random() * 19}s`);
    heart.style.setProperty("--sway", `${(Math.random() - .5) * 70}px`);
    heart.style.setProperty("--c", colors[i % colors.length]);
    hearts.append(heart);
  }
}

/* ---------- pomoćne funkcije ---------- */

function show(stage) {
  stage.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.add("is-active")));
}

function hide(stage) {
  stage.classList.remove("is-active");
  window.setTimeout(() => { stage.hidden = true; }, reducedMotion ? 0 : 800);
}

/*
 * Telefoni (posebno iPhone) puštaju zvuk samo posle dodira.
 * Zato pri otkidanju karte "probudimo" video i pesmu, pa ih kasnije možemo pustiti.
 */
function unlock(media, stillWanted) {
  media.muted = true;
  const attempt = media.play();
  if (!attempt) return;
  attempt
    .then(() => {
      if (stillWanted()) return;
      media.pause();
      media.currentTime = 0;
    })
    .catch(() => {});
}

film.addEventListener("loadedmetadata", () => {
  if (film.videoWidth && film.videoHeight) {
    screen.style.setProperty("--r", (film.videoWidth / film.videoHeight).toFixed(4));
  }
});

film.addEventListener("error", () => {
  filmMissing = true;
  console.info("Video nije pronađen: stavi ga u assets/our-video.mp4");
  if (filmStarted) showMissing();
});

/* ---------- 1. ulaznica ---------- */

ticket.addEventListener("click", async () => {
  unlock(film, () => filmStarted);
  unlock(song, () => songWanted);

  ticket.setAttribute("aria-disabled", "true");
  ticketStage.classList.add("is-torn");
  await wait(1300);

  hide(ticketStage);
  show(theater);
  await wait(500);
  runShow();
}, { once: true });

/* ---------- 2. projekcija ---------- */

async function runShow() {
  filmStarted = false;
  screenCard.classList.remove("is-gone");
  screenMissing.hidden = true;

  await wait(900);
  theater.classList.add("is-open");
  await wait(2900);

  screenCard.classList.add("is-gone");
  await runCountdown();

  if (filmMissing) {
    showMissing();
    return;
  }
  startFilm();
}

async function runCountdown() {
  countdown.hidden = false;
  for (const number of [3, 2, 1]) {
    count.textContent = number;
    countdown.classList.remove("tick");
    void countdown.offsetWidth;
    countdown.classList.add("tick");
    await wait(1000);
  }
  countdown.hidden = true;
}

function startFilm() {
  filmStarted = true;
  film.muted = false;
  film.currentTime = 0;
  film.controls = true;
  document.body.classList.add("is-playing");

  const attempt = film.play();
  if (attempt) attempt.catch(() => { screenPlay.hidden = false; });
}

screenPlay.addEventListener("click", () => {
  screenPlay.hidden = true;
  film.muted = false;
  film.play().catch(() => { screenPlay.hidden = false; });
});

film.addEventListener("ended", () => {
  if (filmStarted) endShow();
});

async function showMissing() {
  screenPlay.hidden = true;
  screenMissing.hidden = false;
  await wait(3500);
  endShow();
}

async function endShow() {
  filmStarted = false;
  film.pause();
  film.controls = false;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  if (film.webkitDisplayingFullscreen) film.webkitExitFullscreen();

  document.body.classList.remove("is-playing");
  theater.classList.remove("is-open");
  await wait(2500);

  hide(theater);
  await wait(400);
  window.scrollTo(0, 0);
  show(credits);
  playSong();
}

/* ---------- 3. odjavna špica ---------- */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-in");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .2 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function setVinyl(playing) {
  vinyl.hidden = false;
  vinyl.setAttribute("aria-pressed", String(playing));
  vinyl.setAttribute("aria-label", playing ? "Pauziraj našu pesmu" : "Pusti našu pesmu");
}

function playSong() {
  songWanted = true;
  song.muted = false;
  const attempt = song.play();
  setVinyl(true);
  if (attempt) attempt.catch(() => setVinyl(false));
}

function pauseSong() {
  songWanted = false;
  song.pause();
  setVinyl(false);
}

vinyl.addEventListener("click", () => {
  if (song.paused) playSong();
  else pauseSong();
});

$("#replay").addEventListener("click", async () => {
  pauseSong();
  vinyl.hidden = true;
  unlock(film, () => filmStarted);
  hide(credits);
  await wait(800);
  show(theater);
  await wait(500);
  runShow();
});
