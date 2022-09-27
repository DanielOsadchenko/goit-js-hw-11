import Notiflix from 'notiflix';
const axios = require('axios');
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formRef = document.querySelector(".search-form");
const galleryRef = document.querySelector(".gallery");
const loadMoreBtnRef = document.querySelector(".load-more");

let page = 1;

const galleryLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

formRef.addEventListener("submit", onForm);
loadMoreBtnRef.addEventListener('click', loadMore);

function onForm(event) {
  event.preventDefault();
  
  loadMoreBtnRef.classList.add("is-hidden");
  clearGallery();
  clearPage();
  animationForm();
  setTimeout(() => {
    fetchImages().then(renderImages).then(notificationTotalHits).then(endOfImages).then(() => { loadMoreBtnRef.classList.remove("is-hidden") })
  }, 250);
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

// ЗАГРУЗИТЬ БОЛЬШЕ
function loadMore() {
  loadMoreBtnRef.classList.add("is-hidden");
  fetchImages().then(renderImages).then(visibleBtn).then(endOfImages);
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
    loadMoreBtnRef.classList.add("is-hidden");
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.")
    return images;
  }
  return images;
}

// Сделать анимашку
function animationForm() {
  formRef.classList.add("search-form-active");
  document.body.classList.remove("bg-image");
}

// Показать кнопку
function visibleBtn(images) {
  loadMoreBtnRef.classList.remove("is-hidden")
  return images
}

