// Load all lesson buttons on page load
const loadLessons = () => {
    const url = 'https://openapi.programming-hero.com/api/levels/all';
    fetch(url)
        .then(res => res.json())
        .then(data => displayLessons(data.data));
};

const displayLessons = lessons => {
    const lessonsContainer = document.getElementById('lessons-container');
    lessonsContainer.innerHTML = lessons.map(lesson => `
        <button onclick="loadLessonDetails(${lesson.level_no})" 
            class="btn btn-outline btn-primary w-40 rounded-md">
            <i class="fa-brands fa-leanpub"></i> Lesson - ${lesson.level_no}
        </button>
    `).join('');
};
loadLessons();

// load lesson details when a lesson button is clicked
const loadLessonDetails = lessonId => {
    const url = `https://openapi.programming-hero.com/api/level/${lessonId}`;
    fetch(url)
        .then(res => res.json())
        .then(data => displayLessonDetails(data.data));
};

const displayLessonDetails = lessons => {
    // hide the empty state div
    const emptyContainer = document.getElementById('empty-container');
    if (emptyContainer) emptyContainer.style.display = 'none';

    // target the cards-wrapper div, if it doesn't exist, create it
    let cardsWrapper = document.getElementById('cards-wrapper');
    if (!cardsWrapper) {
        cardsWrapper = document.createElement('div');
        cardsWrapper.id = 'cards-wrapper';
        cardsWrapper.className = 'w-11/12 mx-auto bg-gray-100 rounded-3xl p-4 mt-3 mb-20'; 
        document.getElementById('lesson-details-container').appendChild(cardsWrapper);
    }

    cardsWrapper.innerHTML = '';

    if (lessons.length === 0) {
        cardsWrapper.innerHTML = `
            <div id="notFound-container" class="w-11/12 mx-auto bg-gray-100 rounded-3xl p-10 text-center mb-20">
            <div class="w-full h-20 flex items-center justify-center text-7xl text-gray-500 mb-4">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <p class="font-bangla text-sm text-gray-500 mb-4">এই Lesson এ এখনো কোন Vocabulary যুক্ত করা হয়নি।</p>
            <h2 class="font-bangla text-3xl text-bold">নেক্সট Lesson এ যান</h2>
        </div>
        `;
    };

    const div = document.createElement('div');
    div.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';

    div.innerHTML = lessons.map(detail => `
        <div class="card bg-white shadow-sm rounded-lg p-8">
            <div class="flex flex-col items-center gap-3 mb-8">
                <h2 class="text-2xl font-semibold">${detail.word}</h2>
                <p class="text-gray-600 text-md">meaning / pronunciation</p>
                <p class="text-gray-700 text-2xl font-semibold font-bangla">"${detail.meaning}"</p>
            </div>
            <div class="flex justify-between">
                <button onclick="showInfo('${detail.word}', '${detail.meaning}')" class="btn btn-square bg-blue-100">
                    <i class="fa-solid fa-circle-info"></i>
                </button>
                <button onclick="speakWord('${detail.word}')" class="btn btn-square bg-blue-100">
                    <i class="fa-solid fa-volume-high"></i>
                </button>
            </div>
        </div>
    `).join('');

    cardsWrapper.appendChild(div);
};

// Sound button
const speakWord = word => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
};

// Info button
const showInfo = (word, meaning) => {
    alert(`Word: ${word}\nMeaning: ${meaning}`);
};