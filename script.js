/*
 * Dodaj tri fotografije u assets/photos/ i upiši njihove putanje ispod.
 * Primer: "assets/photos/nasa-fotografija.jpg"
 */
const PHOTOS = [
  "assets/photos/forest-heart.jpg", // glavna fotografija
  "assets/photos/sunset-kiss.jpg",  // druga fotografija
  "assets/photos/forest-kiss.jpg"   // treća fotografija
];

function addPhoto(figure, path, index) {
  const frame = figure.querySelector(".photo-frame");

  if (!path) {
    const placeholder = document.createElement("span");
    placeholder.className = "photo-placeholder";
    placeholder.textContent = `vaša fotografija ${index + 1}`;
    frame.append(placeholder);
    return;
  }

  const image = new Image();
  image.src = path;
  image.alt = `Naša uspomena ${index + 1}`;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    const placeholder = document.createElement("span");
    placeholder.className = "photo-placeholder";
    placeholder.textContent = `fotografija ${index + 1} nije pronađena`;
    image.replaceWith(placeholder);
  }, { once: true });
  frame.append(image);
}

document.querySelectorAll("[data-photo]").forEach((figure, index) => {
  addPhoto(figure, PHOTOS[index], index);
});

const intro = document.querySelector("#intro");
const letterView = document.querySelector("#letter-view");

document.querySelector("#open-letter").addEventListener("click", () => {
  letterView.setAttribute("aria-hidden", "false");
  letterView.classList.add("is-open");
  intro.classList.add("is-open");
  window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
});
