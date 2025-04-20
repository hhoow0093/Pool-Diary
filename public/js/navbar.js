const Hamburger = document.querySelector('.hamburger');
const closeButton = document.querySelector('.close-button');
const HamburgerLists = document.querySelector('.hamburger-lists')

Hamburger.addEventListener('click', () => { 
    HamburgerLists.classList.remove('close');
})

closeButton.addEventListener('click', () => { 
    HamburgerLists.classList.add('close');
})