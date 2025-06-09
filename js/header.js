document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const headerRight = document.querySelector('.header__right');

    // Подставляем имя и аватар из localStorage (userProfile)
    try {
        const userProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (userProfile) {
            const headerNickname = document.getElementById('headerNickname');
            const headerAvatar = document.getElementById('headerAvatar');
            if (headerNickname) headerNickname.textContent = userProfile.displayName || 'user nickname';
            if (headerAvatar) headerAvatar.src = userProfile.avatar || '../assets/img/avatar_profile.png';
        }
    } catch (e) {}

    if (burgerMenu && headerRight) {
        burgerMenu.addEventListener('click', function() {
            headerRight.classList.toggle('active');
            burgerMenu.classList.toggle('active');
        });

        // Закрываем меню при клике вне его
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.header__nav') && headerRight.classList.contains('active')) {
                headerRight.classList.remove('active');
                burgerMenu.classList.remove('active');
            }
        });
    }
}); 