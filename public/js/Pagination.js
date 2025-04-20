window.addEventListener('load', ()=> {
    const cards = document.querySelectorAll('.mycard');
    const paginationLinks = document.querySelectorAll('.pagination .page-link');
    const pageItem = document.querySelectorAll('.pagination .page-item');
    const cardsPerPage = 5;
    let currentPage = 1;

    function showPage(page) {
        const start = (page - 1) * cardsPerPage;
        const end = start + cardsPerPage;


        cards.forEach((card, index) => {
            card.style.display = (index >= start && index < end) ? 'block' : 'none';
        });
    }
    paginationLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');

            if (page === 'prev' && currentPage > 1) {
                pageItem[currentPage].classList.remove('active');
                currentPage--;
                pageItem[currentPage].classList.add('active');
            } else if (page === 'next' && currentPage < Math.ceil(cards.length / cardsPerPage)) {
                pageItem[currentPage].classList.remove('active');
                currentPage++;
                pageItem[currentPage].classList.add('active');
            } else if (!isNaN(page)) {
                pageItem.forEach(item => item.classList.remove('active'));
                currentPage = parseInt(page);
                pageItem[currentPage].classList.add('active');
            }

            showPage(currentPage);
        });
    });

    showPage(currentPage);
})