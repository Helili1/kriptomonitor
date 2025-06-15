// Класс для работы с профилем
class ProfileManager {
    constructor() {
        this.profileData = {
            displayName: 'Имя пользователя',
            email: 'user@example.com',
            description: 'Здесь будет отображаться информация о пользователе. На данный момент описание отсутствует.',
            avatar: '../assets/img/avatar_profile.png',
            postsCount: 0,
            viewsCount: 0,
            notifications: false,
            privacy: false
        };
        this.userEmail = null; // email авторизованного пользователя
        this.init();
    }

    // Инициализация
    async init() {
        await this.loadProfileFromServerOrStorage();
        this.setupEventListeners();
        this.updateUI();
    }

    // Загрузка данных профиля с сервера или localStorage
    async loadProfileFromServerOrStorage() {
        try {
            // Получаем данные пользователя с сервера
            const res = await fetch('http://127.0.0.1:3001/api/profile', { credentials: 'include' });
            if (res.ok) {
                const user = await res.json();
                this.userEmail = user.email;
                
                // Получаем сохраненные данные из localStorage
                const savedProfile = localStorage.getItem('userProfile_' + this.userEmail);
                const currentUser = localStorage.getItem('currentUser');
                
                if (savedProfile) {
                    // Если есть сохраненный профиль, используем его
                    this.profileData = JSON.parse(savedProfile);
                } else if (currentUser) {
                    // Если нет сохраненного профиля, но есть данные текущего пользователя
                    const userData = JSON.parse(currentUser);
                    this.profileData = {
                        displayName: userData.display_name || 'Имя пользователя',
                        email: userData.email,
                        description: 'Здесь будет отображаться информация о пользователе. На данный момент описание отсутствует.',
                        avatar: userData.avatar || '../assets/img/avatar_default.png',
                        postsCount: 0,
                        viewsCount: 0,
                        notifications: false,
                        privacy: false
                    };
                    // Сохраняем начальный профиль
                    this.saveProfile();
                } else {
                    // Если нет никаких данных, используем данные с сервера
                    this.profileData = {
                        displayName: user.display_name || 'Имя пользователя',
                        email: user.email,
                        description: 'Здесь будет отображаться информация о пользователе. На данный момент описание отсутствует.',
                        avatar: getAvatarUrl(user.avatar),
                        postsCount: 0,
                        viewsCount: 0,
                        notifications: false,
                        privacy: false
                    };
                    // Сохраняем начальный профиль
                    this.saveProfile();
                }
            } else {
                // Если не авторизован, перенаправляем на главную
                window.location.href = '/';
            }
        } catch (e) {
            console.error('Ошибка загрузки профиля:', e);
            // Если ошибка сети, перенаправляем на главную
            window.location.href = '/';
        }
    }

    // Сохранение данных профиля в localStorage по email
    saveProfile() {
        if (this.userEmail) {
            localStorage.setItem('userProfile_' + this.userEmail, JSON.stringify(this.profileData));
        } else {
            localStorage.setItem('userProfile', JSON.stringify(this.profileData));
        }
        this.showNotification('Профиль успешно обновлен', 'success');
    }

    // Обновление UI
    updateUI() {
        document.getElementById('displayName').textContent = this.profileData.displayName;
        document.getElementById('userEmail').textContent = this.profileData.email;
        document.getElementById('profileDescription').textContent = this.profileData.description;
        document.getElementById('avatarPreview').src = getAvatarUrl(this.profileData.avatar);
        document.getElementById('postsCount').textContent = this.profileData.postsCount;
        document.getElementById('viewsCount').textContent = this.profileData.viewsCount;
        document.getElementById('notificationsToggle').checked = this.profileData.notifications;
        document.getElementById('privacyToggle').checked = this.profileData.privacy;
        // Обновляем шапку на всех страницах
        const headerNickname = document.getElementById('headerNickname');
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerNickname) headerNickname.textContent = this.profileData.displayName;
        if (headerAvatar) headerAvatar.src = getAvatarUrl(this.profileData.avatar);
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        document.getElementById('avatarInput').addEventListener('change', (e) => this.handleAvatarUpload(e));
        $('#editProfileModal').on('show.bs.modal', () => {
            document.getElementById('editDisplayName').value = this.profileData.displayName;
            document.getElementById('editEmail').value = this.profileData.email;
            document.getElementById('editDescription').value = this.profileData.description;
            document.getElementById('editAvatar').value = '';
        });
        document.getElementById('saveProfileButton').addEventListener('click', () => this.handleProfileSave());
        document.getElementById('notificationsToggle').addEventListener('change', (e) => {
            this.profileData.notifications = e.target.checked;
            this.saveProfile();
        });
        document.getElementById('privacyToggle').addEventListener('change', (e) => {
            this.profileData.privacy = e.target.checked;
            this.saveProfile();
        });
    }

    // Обработка загрузки аватара
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.profileData.avatar = e.target.result;
                this.updateUI();
                this.saveProfile();
            };
            reader.readAsDataURL(file);
        }
    }

    // Обработка сохранения профиля
    async handleProfileSave() {
        const newDisplayName = document.getElementById('editDisplayName').value.trim();
        const newEmail = document.getElementById('editEmail').value.trim();
        const newDescription = document.getElementById('editDescription').value.trim();
        const editAvatarInput = document.getElementById('editAvatar');
        const newAvatarFile = editAvatarInput.files[0];
        if (!newDisplayName || !newEmail) {
            this.showNotification('Пожалуйста, заполните имя и почту', 'error');
            return;
        }
        let avatarData = this.profileData.avatar;
        if (newAvatarFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                avatarData = e.target.result;
                await this.saveProfileToServer(newDisplayName, newEmail, newDescription, avatarData);
            };
            reader.readAsDataURL(newAvatarFile);
        } else {
            await this.saveProfileToServer(newDisplayName, newEmail, newDescription, avatarData);
        }
    }

    // Сохраняем профиль на сервере
    async saveProfileToServer(displayName, email, description, avatar) {
        try {
            const res = await fetch('http://127.0.0.1:3001/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ display_name: displayName, email: email, description: description, avatar: avatar }),
                credentials: 'include'
            });
            if (res.ok) {
                this.profileData.displayName = displayName;
                this.profileData.email = email;
                this.profileData.description = description;
                this.profileData.avatar = avatar;
                this.updateUI();
                this.saveProfile();
                this.showNotification('Профиль успешно обновлён', 'success');
                // Обновляем шапку на всех страницах
                if (window.parent) {
                    setTimeout(() => window.location.reload(), 500);
                }
                $('#editProfileModal').modal('hide');
            } else {
                const data = await res.json();
                this.showNotification(data.error || 'Ошибка обновления профиля', 'error');
            }
        } catch (e) {
            this.showNotification('Ошибка сети', 'error');
        }
    }

    // Показ уведомлений
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.getElementById('notificationContainer').appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Загрузка данных профиля
    loadProfile() {
        if (this.userEmail) {
            const savedProfile = localStorage.getItem('userProfile_' + this.userEmail);
            if (savedProfile) {
                this.profileData = JSON.parse(savedProfile);
            }
        } else {
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                this.profileData = JSON.parse(savedProfile);
            }
        }
    }
}

function getAvatarUrl(avatar) {
    if (!avatar) return '../assets/img/avatar_default.png';
    if (avatar.startsWith('data:')) return avatar;
    if (/^(http|\/)/.test(avatar)) return avatar;
    return '../assets/img/' + avatar;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const profileManager = new ProfileManager();
});