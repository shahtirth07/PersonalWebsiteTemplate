function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    
    if (!menu || !icon) {
        console.error("Menu elements not found");
        return;
    }
    
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    
    if (!menu || !icon) return;
    
    const isClickInside = menu.contains(event.target) || icon.contains(event.target);
    
    if (!isClickInside && menu.classList.contains('open')) {
        menu.classList.remove('open');
        icon.classList.remove('open');
    }
});