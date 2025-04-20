document.addEventListener('DOMContentLoaded', () => {
    // updating diary
    const updateModal = document.getElementById('myUpdatemodal');
    const updateButtons = document.querySelectorAll('.update-btn');
    
    // searching diary
    const inputSearchDiary = document.getElementById('search-diary');
    const cards_diary = document.querySelectorAll('.cards');

    const pinned_diary_search = document.getElementById('search-diary-pinned');
    const pinned_diaries = document.querySelectorAll('.pinned-cards')

    // every button is pressed, old data is generated
    updateButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get data attributes from the clicked button
            const diaryId = button.getAttribute('data-id');
            const diaryTitle = button.getAttribute('data-title');
            const diaryDate = button.getAttribute('data-date');
            const diaryDesc = button.getAttribute('data-desc');
            const diaryStory = button.getAttribute('data-story');

            // Populate the modal fields
            updateModal.querySelector('input[name="title"]').value = diaryTitle;
            updateModal.querySelector('input[name="date"]').value = diaryDate;
            updateModal.querySelector('input[name="desc"]').value = diaryDesc;
            updateModal.querySelector('textarea[name="story"]').value = diaryStory;
            updateModal.querySelector('input[name="id"]').value = diaryId;

        });
    });
    // live search for diary
    inputSearchDiary.addEventListener('input', () => {
        const searchValue = inputSearchDiary.value.toLowerCase().trim();
        
        cards_diary.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const date = card.querySelector('h6').textContent.toLowerCase();

            if (title.includes(searchValue) || date.includes(searchValue)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
        
    });

    // pinned diary live search
    pinned_diary_search.addEventListener('input', () => {
        const userInput = pinned_diary_search.value.toLowerCase().trim();
        
        pinned_diaries.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const date = card.querySelector('h6').textContent.toLocaleLowerCase();

            if (title.includes(userInput) || date.includes(userInput)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
            
        });
        
    });

});

