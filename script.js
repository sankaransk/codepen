const track = document.querySelector(".carousel-track");
const slides = Array.from(track.children);
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let slideWidth = slides[0].getBoundingClientRect().width;

// Arrange the slides next to one another
const setSlidePosition = (slide, index) => {
  slide.style.left = slideWidth * index + "px";
};
slides.forEach(setSlidePosition);

let currentSlideIndex = 0;

const moveToSlide = (index) => {
  track.style.transform = "translateX(-" + slideWidth * index + "px)";
  currentSlideIndex = index;
};

// Next Button Click
nextBtn.addEventListener("click", () => {
  if (currentSlideIndex === slides.length - 1) {
    // If at the end, go back to start
    moveToSlide(0);
  } else {
    moveToSlide(currentSlideIndex + 1);
  }
});

// Previous Button Click
prevBtn.addEventListener("click", () => {
  if (currentSlideIndex === 0) {
    // If at start, go to end
    moveToSlide(slides.length - 1);
  } else {
    moveToSlide(currentSlideIndex - 1);
  }
});

// Optional: Auto-play every 3 seconds
setInterval(() => {
  if (currentSlideIndex === slides.length - 1) {
    moveToSlide(0);
  } else {
    moveToSlide(currentSlideIndex + 1);
  }
}, 3000);

// Handle window resize fixes
window.addEventListener("resize", () => {
  slideWidth = slides[0].getBoundingClientRect().width;
  moveToSlide(currentSlideIndex);
});

/* --- Music Player Logic --- */

const musicBtn = document.getElementById("musicBtn");
const audio = document.getElementById("loveSong");
let isPlaying = false;

musicBtn.addEventListener("click", () => {
  if (isPlaying) {
    audio.pause();
    musicBtn.innerHTML = "🎵 Play Music"; // Change text back
    isPlaying = false;
  } else {
    audio.play();
    musicBtn.innerHTML = "⏸️ Pause Music"; // Change text to Pause
    isPlaying = true;
  }
});
