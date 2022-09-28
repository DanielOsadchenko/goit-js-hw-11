// Імпорт
import Notiflix from 'notiflix';
const axios = require('axios');
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// Рефи
const formRef = document.querySelector(".search-form");
const galleryRef = document.querySelector(".gallery");
const sentinelRef = document.querySelector('#sentinel');

// Змінні
let page = 1;

// Лайтбокс
const galleryLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

// Слухачі
formRef.addEventListener("submit", onForm);
const observer = new IntersectionObserver(callback, options);
// ФункціІ
function onForm(event) {
  event.preventDefault();

  clearGallery();
  clearPage();
  animationForm();

  setTimeout(() => {
    fetchImages().then(renderImages).then(notificationTotalHits).then(endOfImages)
  }, 250);

  observer.observe(sentinelRef);
};


// ХТТП ЗАПРОС
async function fetchImages() {
  
  try {
    const url = `https://pixabay.com/api/?key=30188307-c49a871897b6d5bfff07bff1b&q=${formRef.elements.searchQuery.value.trim()}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;
    const response = await axios.get(url);
    return response
  }
  catch {
    throw new Error("Что-то пошло не так");
  }
};

// РЕНДЕР КАРТИНОК
function renderImages(images) {
  if (images.data.hits.length === 0) {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    observer.unobserve(sentinelRef);
    return;
  }
  
  
  addPage();
  images.data.hits.map(image => {
    const markup = `<div class="photo-card">
      <a href="${image.largeImageURL}"><img class="image" src="${image.webformatURL}" alt="${image.tags}"
    loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          ${image.likes}<b>Likes</b>
        </p>
        <p class="info-item">
          ${image.views}<b>Views</b>
        </p>
        <p class="info-item">
          ${image.comments}<b>Comments</b>
        </p>
        <p class="info-item">
          ${image.downloads}<b>Downloads</b>
        </p>
      </div>
    </div>`;
    galleryRef.insertAdjacentHTML("beforeend", markup);
    galleryLightbox.refresh();
  });
  return images;
  
};

// УВЕДОМЛЕНИЕ ВСЕГО ВАРИАНТОВ
function notificationTotalHits(images) {
  Notiflix.Notify.success(`Hooray! We found ${images.data.totalHits} images.`)
  return images;
}

// ЧИСТКА ГАЛЕРЕИ
function clearGallery() {
  galleryRef.innerHTML = "";
}

// ДОБАВИТЬ  +1 СТРАНИЦУ
function addPage() {
  page += 1;
};

// ОЧИСТИТЬ СЧЕТЧИК СТРАНИЦ
function clearPage() {
  page = 1;
}

// УВЕДОМИТЬ ЧТО ЗАКОНЧИЛИСЬ КАРТИНКИ
function endOfImages(images) {
  if (images.data.hits.length < 40) {
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    return
  }
  return images;
}

// Сделать анимашку
function animationForm() {
  formRef.classList.add("search-form-active");
  document.body.classList.remove("bg-image");
}

// бесконечный скрол

  const options = {
  root: document.querySelector('#scrollArea'),
  rootMargin: '300px',
  threshold: 1.0
}
const callback = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && formRef.elements.searchQuery.value.trim() !== '') {
      fetchImages().then(renderImages).then(endOfImages)
    }
  })
}






