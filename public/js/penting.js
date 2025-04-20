window.addEventListener('load', function () {
    setTimeout(() => {
        const loader = document.querySelector('.loader');
        loader.classList.add('load-hidden');
        // to make sure animation plays first
        loader.addEventListener('animationend', () => {
            loader.style.display = "none";
        }, { once: true });
    }, 3000);
})
