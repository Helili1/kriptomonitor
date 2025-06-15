document.addEventListener('DOMContentLoaded', async function () {
    const burgerMenu = document.querySelector('.burger-menu');
    const headerRight = document.querySelector('.header__right');

    try {
        const res = await fetch('http://127.0.0.1:3001/api/profile', { credentials: 'include' });
        if (res.ok) {
            const user = await res.json();
            updateHeaderUser(user);
        } else {
            showLoginButton();
        }
    } catch {
        showLoginButton();
    }

    function getAvatarUrl(avatar) {
        if (!avatar) return getDefaultAvatar();
        if (avatar.startsWith('data:')) return avatar;
        if (/^(http|\/)/.test(avatar)) return avatar;
        // Определяем относительный путь
        const isRoot = window.location.pathname === '/' || window.location.pathname === '/index.html';
        if (isRoot) {
            return 'assets/img/' + avatar;
        } else {
            return '../assets/img/' + avatar;
        }
    }

    function getDefaultAvatar() {
        const isRoot = window.location.pathname === '/' || window.location.pathname === '/index.html';
        return isRoot ? 'assets/img/avatar_default.png' : '../assets/img/avatar_default.png';
    }

    function updateHeaderUser(user) {
        const headerAvatar = document.getElementById('headerAvatar');
        const headerNickname = document.getElementById('headerNickname');
        const headerRole = document.getElementById('headerRole');
        if (headerAvatar) headerAvatar.src = getAvatarUrl(user.avatar);
        if (headerNickname) headerNickname.textContent = user.display_name || user.email;
        if (headerRole) headerRole.textContent = 'Вы';
    }

    function showLoginButton() {
        const userProfileLink = document.querySelector('.user__profile-link');
        if (userProfileLink) {
            userProfileLink.style.display = 'none';
        }
        // Кнопка входа уже есть в модальных окнах, не добавляем её в .header__right
    }

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