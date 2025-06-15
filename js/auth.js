// Проверка авторизации пользователя при загрузке страницы
$(document).ready(function () {
  checkAuthStatus();

  // Обработка формы регистрации
  $('#registerButton').on('click', async function (e) {
    e.preventDefault();
    const email = $('#email').val();
    const displayName = $('#displayName').val();
    const password = $('#registerPassword').val();
    const confirmPassword = $('#confirmPassword').val();
    const errorDiv = $('#registerError');
    errorDiv.hide();

    if (password !== confirmPassword) {
      errorDiv.text('Пароли не совпадают').show();
      return;
    }
    try {
      const res = await fetch('http://127.0.0.1:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, display_name: displayName, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        errorDiv.text(data.error || 'Ошибка регистрации').show();
      } else {
        $('#registerModal').modal('hide');
        $('#authModal').modal('show');
      }
    } catch (err) {
      errorDiv.text('Ошибка сети').show();
    }
  });

  // Обработка формы входа
  $('#authModal .btn-primary').on('click', async function (e) {
    e.preventDefault();
    const email = $('#login').val();
    const password = $('#password').val();
    const errorDiv = $('#authModal .text-danger');
    errorDiv.hide();
    try {
      const res = await fetch('http://127.0.0.1:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        errorDiv.text(data.error || 'Ошибка входа').show();
      } else {
        $('#authModal').modal('hide');
        checkAuthStatus();
        // Если мы на странице профиля, обновляем её
        if (window.location.pathname.includes('profile.html')) {
          window.location.reload();
        }
      }
    } catch (err) {
      errorDiv.text('Ошибка сети').show();
    }
  });

  // Выход из аккаунта
  $(document).on('click', '#logoutButton', async function () {
    try {
      await fetch('http://127.0.0.1:3001/api/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
      checkAuthStatus();
      // Если мы на странице профиля, перенаправляем на главную
      if (window.location.pathname.includes('profile.html')) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Ошибка при выходе:', err);
    }
  });
});

// Проверка статуса авторизации и обновление шапки
async function checkAuthStatus() {
  try {
    const res = await fetch('http://127.0.0.1:3001/api/profile', { credentials: 'include' });
    if (res.ok) {
      const user = await res.json();
      showUserProfile(user);
    } else {
      showLoginButton();
    }
  } catch {
    showLoginButton();
  }
}

// Показать профиль пользователя в шапке
function showUserProfile(user) {
  const profileHtml = `
    <li>
      <a href="./pages/profile.html" class="user__profile-link">
        <div class="user__profile">
          <img loading="lazy" class="user__avatar" id="headerAvatar" src="${user.avatar || './assets/img/avatar_default.png'}" alt="avatar_user" />
          <div class="user__info">
            <span class="user__nickname" id="headerNickname">${user.display_name || user.email}</span>
            <span class="user__role">Вы</span>
          </div>
        </div>
      </a>
    </li>
    <li><button id="logoutButton" class="btn btn-outline-primary ml-3">Выйти</button></li>
  `;
  $('.header__right').html(profileHtml);
}

// Показать кнопку входа/регистрации в шапке
function showLoginButton() {
  const loginHtml = `
    <li>
      <button class="btn btn-primary" id="openAuthModal">Войти / Зарегистрироваться</button>
    </li>
  `;
  $('.header__right').html(loginHtml);
  // Открытие модального окна по клику
  $('#openAuthModal').on('click', function () {
    $('#authModal').modal('show');
  });
} 