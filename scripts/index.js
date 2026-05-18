// =============================================
// Global word store — id দিয়ে modal access করব
// =============================================
const wordStore = {};

// =============================================
// Saved words store — favorite করা words এখানে থাকবে
// =============================================
const savedWords = new Set();

// =============================================
// সব word একবার load করে রাখব — search এর জন্য
// =============================================
let allWords = [];

const loadAllWords = () => {
    const url = "https://openapi.programming-hero.com/api/words/all";
    fetch(url)
        .then((res) => res.json())
        .then((data) => {
            allWords = data.data;
        });
};
loadAllWords();

// =============================================
// Load all lesson buttons on page load
// =============================================
const loadLessons = () => {
    const url = "https://openapi.programming-hero.com/api/levels/all";
    fetch(url)
        .then((res) => res.json())
        .then((data) => displayLessons(data.data));
};

// =============================================
// set Active lesson button function
// =============================================
const activeLessonBtn = (lessonId) => {
    const allButtons = document.querySelectorAll(".lesson-button");
    allButtons.forEach((btn) => btn.classList.remove("bg-primary", "text-white"));
    const clickedButton = document.getElementById(`lesson-button-${lessonId}`);
    if (clickedButton) clickedButton.classList.add("bg-primary", "text-white");
};

// =============================================
// Display lesson buttons dynamically
// =============================================
const displayLessons = (lessons) => {
    const lessonsContainer = document.getElementById("lessons-container");
    lessonsContainer.innerHTML = lessons
        .map(
            (lesson) => `
        <button id="lesson-button-${lesson.level_no}" onclick="loadLessonDetails(${lesson.level_no})"
            class="btn btn-outline btn-primary lesson-button w-40 rounded-md">
            <i class="fa-brands fa-leanpub"></i> Lesson - ${lesson.level_no}
        </button>
    `
        )
        .join("");
};
loadLessons();

// =============================================
// Loader functions
// =============================================
const loader = document.getElementById("loader");

function showLoader() {
    loader.classList.remove("hidden");
}
function hideLoader() {
    loader.classList.add("hidden");
}

// =============================================
// Load lesson details when a lesson button is clicked
// =============================================
const loadLessonDetails = (lessonId) => {
    // clears the search input when a lesson is clicked
    document.getElementById("search-input").value = "";

    showLoader();
    // hide previous cards while loading new ones
    const cardsWrapper = document.getElementById("cards-wrapper");
    if (cardsWrapper) {
        cardsWrapper.innerHTML = "";
        cardsWrapper.remove();
    }
    const url = `https://openapi.programming-hero.com/api/level/${lessonId}`;
    fetch(url)
        .then((res) => res.json())
        .then((data) => {
            activeLessonBtn(lessonId);
            setTimeout(() => {
                hideLoader();
                displayLessonDetails(data.data);
            }, 400);
        });
};

// =============================================
// Display lesson details (cards)
// =============================================
const displayLessonDetails = (allCards, isSavedView = false) => {
    const emptyContainer = document.getElementById("empty-container");
    if (emptyContainer) emptyContainer.style.display = "none";

    let cardsWrapper = document.getElementById("cards-wrapper");
    if (!cardsWrapper) {
        cardsWrapper = document.createElement("div");
        cardsWrapper.id = "cards-wrapper";
        cardsWrapper.className =
            "w-11/12 mx-auto bg-gray-100 rounded-3xl p-4 mt-3 mb-20";
        document
            .getElementById("lesson-details-container")
            .appendChild(cardsWrapper);
    }

    cardsWrapper.innerHTML = "";

    if (allCards.length === 0) {
        cardsWrapper.innerHTML = `
            <div class="w-11/12 mx-auto rounded-3xl p-10 text-center mb-20">
                <div class="w-full h-20 flex items-center justify-center text-7xl text-gray-500 mb-4">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <p class="font-bangla text-sm text-gray-500 mb-4">এই Lesson এ এখনো কোন Vocabulary যুক্ত করা হয়নি।</p>
                <h2 class="font-bangla text-3xl font-bold">নেক্সট Lesson এ যান</h2>
            </div>
        `;
        return;
    }

    allCards.forEach((word) => {
        wordStore[word.id] = word;
    });

    renderCards(allCards, cardsWrapper, isSavedView);
};

// =============================================
// Card rendering — reusable function
// isSavedView = true হলে remove on unfavorite কাজ করবে
// =============================================
const renderCards = (words, container, isSavedView = false) => {
    const div = document.createElement("div");
    div.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5";

    div.innerHTML = words
        .map((card) => {

            const meaningHTML = card.meaning
    ? `<span class="text-2xl font-semibold font-bangla">${card.meaning}</span>`
    : `<span class="text-red-500 font-semibold text-2xl font-bangla">অর্থ পাওয়া যায়নি</span>`;

            // heartClass এ শুধু solid/regular রাখো, color আলাদা করে handle করো
            const isSaved = savedWords.has(card.id);
            const heartSolid = isSaved ? "fa-solid" : "fa-regular";
            const heartColor = isSaved ? "text-black-500" : "";

            return `
            <div class="card bg-white shadow-sm rounded-lg p-8" data-id="${card.id}">
                <div class="flex flex-col items-center gap-3 mb-8">
                    <h2 class="text-2xl font-semibold">${card.word}</h2>
                    <p class="text-gray-600 text-md">meaning / pronunciation</p>
                    <p class="text-2xl font-semibold font-bangla text-center">
                    ${meaningHTML} / ${card.pronunciation}
                    </p>
                </div>
                <div class="flex justify-between items-center">
                    <button onclick="showModal(${card.id})" class="btn btn-square bg-blue-100">
                        <i class="fa-solid fa-circle-info"></i>
                    </button>

                    <button onclick="toggleFavorite(${card.id}, this, ${isSavedView})" class="fav-btn btn btn-circle btn-ghost">
                        <i class="${heartSolid} fa-heart text-2xl ${heartColor}"></i>
                    </button>

                    <button onclick="speakWord('${card.word}')" class="btn btn-square bg-blue-100">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                </div>
            </div>
        `;
        })
        .join("");

    container.appendChild(div);
};

// =============================================
// toggleFavorite — isSavedView true হলে card remove হবে
// =============================================
const toggleFavorite = (wordId, btn, isSavedView = false) => {
    const icon = btn.querySelector("i");

    if (savedWords.has(wordId)) {
        // save করা ছিল → remove করো
        savedWords.delete(wordId);
        icon.className = "fa-regular fa-heart text-2xl"; // outline heart

        // saved view এ থাকলে card টাও DOM থেকে সরিয়ে দাও
        if (isSavedView) {
            const card = btn.closest(".card");
            card.remove();

            // সব card চলে গেলে empty state 
            const cardsWrapper = document.getElementById("cards-wrapper");
            const remaining = cardsWrapper.querySelectorAll(".card");
            if (remaining.length === 0) {
                cardsWrapper.innerHTML = `
                    <div class="w-11/12 mx-auto rounded-3xl p-10 text-center mb-20">
                        <div class="w-full h-20 flex items-center justify-center text-7xl text-gray-500 mb-4">
                            <i class="fa-regular fa-heart"></i>
                        </div>
                        <p class="font-bangla text-sm text-gray-500 mb-2">আপনি এখনো কোনো word save করেননি।</p>
                        <h2 class="font-bangla text-2xl font-bold">Lesson থেকে word favorite করুন</h2>
                    </div>
                `;
            }
        }
    } else {
        // নতুন → save
        savedWords.add(wordId);
        icon.className = "fa-solid fa-heart text-2xl text-black-500"; // filled black heart
    }
};

// =============================================
// Saved words button functionality
// =============================================
document.getElementById("saved-words-btn").addEventListener("click", () => {
    const savedList = [...savedWords].map((id) => wordStore[id]).filter(Boolean);

    displayLessonDetails(savedList, true);

    // saved view এ থাকলে কোন lesson active থাকবে না
    activeLessonBtn(null);
});

// =============================================
// Search functionality
// =============================================
const handleSearch = () => {
    const query = document
        .getElementById("search-input")
        .value.trim()
        .toLowerCase();

    if (!query) return;

    const results = allWords.filter((word) =>
        word.word.toLowerCase().includes(query)
    );

    displayLessonDetails(results);

    // search করলে কোন lesson active থাকবে না
    activeLessonBtn(null);
};

document.getElementById("search-btn").addEventListener("click", handleSearch);
document
    .getElementById("search-input")
    .addEventListener("keydown", function (event) {
        if (event.key === "Enter") handleSearch();
    });

// =============================================
// Sound button
// =============================================
const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
};

// =============================================
// Info button — Modal
// API থেকে fresh data fetch করে modal দেখাবে
// =============================================
const showModal = (wordId) => {
    const existing = document.getElementById("word-modal");
    if (existing) existing.remove();

    const loadingModal = document.createElement("dialog");
    loadingModal.id = "word-modal";
    loadingModal.className = "modal modal-bottom sm:modal-middle";
    loadingModal.innerHTML = `
        <div class="modal-box w-11/12 rounded-2xl flex justify-center items-center py-16">
            <span class="loading loading-dots loading-lg"></span>
        </div>
    `;
    document.body.appendChild(loadingModal);
    loadingModal.showModal();

    fetch(`https://openapi.programming-hero.com/api/word/${wordId}`)
        .then((res) => res.json())
        .then((data) => {
            const word = data.data;

            const synonymsHTML =
                word.synonyms && word.synonyms.length > 0
                    ? word.synonyms
                        .map(
                            (s) => `
                        <button onclick="speakWord('${s}')" class="btn btn-soft btn-info text-black hover:bg-blue-200">${s}</button>
                    `
                        )
                        .join("")
                    : '<p class="text-gray-400 text-sm">কোনো সমার্থক শব্দ নেই।</p>';

            loadingModal.innerHTML = `
                <div class="modal-box w-11/12 rounded-2xl flex flex-col px-6 pt-6 pb-3">
                    <div class="border border-blue-100 rounded-2xl border-2 p-4 flex flex-col gap-4">
                        <h3 class="text-3xl font-bold">
                            ${word.word}
                            <span class="text-2xl font-bangla">
                                ( <i class="fa-solid fa-microphone"></i> ${word.pronunciation} )
                            </span>
                        </h3>
                        <div>
                            <h2 class="text-xl font-semibold mb-1">Meaning</h2>
                            <p class="font-bangla text-gray-700">${word.meaning ?? "N/A"}</p>
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold mb-1">Example</h2>
                            <p class="text-gray-700">${word.sentence ?? "N/A"}</p>
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold mb-1 font-bangla">সমার্থক শব্দ গুলো</h2>
                            <div class="flex flex-wrap gap-3 mt-2">
                                ${synonymsHTML}
                            </div>
                        </div>
                    </div>
                    <div class="modal-action flex justify-start mt-3 mb-0">
                        <form method="dialog">
                            <button class="btn btn-primary btn-outline rounded-lg">Complete Learning</button>
                        </form>
                    </div>
                </div>
            `;
        })
        .catch(() => {
            loadingModal.innerHTML = `
                <div class="modal-box w-11/12 rounded-2xl flex flex-col items-center gap-4 py-12">
                    <i class="fa-solid fa-circle-exclamation text-5xl text-red-400"></i>
                    <p class="font-bangla text-gray-600">Data load করা যায়নি। আবার চেষ্টা করুন।</p>
                    <form method="dialog">
                        <button class="btn btn-outline">বন্ধ করুন</button>
                    </form>
                </div>
            `;
        });
};
