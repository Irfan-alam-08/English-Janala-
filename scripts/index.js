const loadLessons = () => {
    const url = 'https://openapi.programming-hero.com/api/levels/all';
    fetch(url)
        .then(res => res.json())
        .then(data => displayLessons(data.data))// used (data.data) because the API response has a (data) property that contains the actual lessons data as an array.
};

// this function will display all the lessons button in the UI
const displayLessons = lessons => {
    const lessonsContainer = document.getElementById('lessons-container');
    // Used the map function to create a button for each lesson and join them into a single string, which is then set as the innerHTML of the container
    lessonsContainer.innerHTML = lessons.map(lesson => `
        <button class="btn btn-outline btn-primary w-40 rounded-md">
            <i class="fa-brands fa-leanpub"></i>Lesson -${lesson.level_no}
        </button>
    `).join('');
    // used join('') to convert the array of button strings into a single string, which is necessary for setting the innerHTML correctly.
};
loadLessons();
// To better understand the code above
// const displayLessons = lessons => {
//     const lessonsContainer = document.getElementById('lessons-container');
//     lessonsContainer.innerHTML = "";
//     for (const lesson of lessons) {
//         const button = document.createElement('button');
//         button.className =
//             'btn btn-outline btn-primary w-40 rounded-md';
//         button.innerHTML = `
//             <i class="fa-brands fa-leanpub"></i>
//             Lesson - ${lesson.level_no}
//         `;
//         button.onclick = () => loadLessonDetails(lesson.id);
//         lessonsContainer.appendChild(button);
//     }
// };

