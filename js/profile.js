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
        
        this.init();
    }

    // Инициализация
    init() {
        this.loadProfile();
        this.setupEventListeners();
        this.updateUI();
    }

    // Загрузка данных профиля
    loadProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            this.profileData = JSON.parse(savedProfile);
        }
    }

    // Сохранение данных профиля
    saveProfile() {
        localStorage.setItem('userProfile', JSON.stringify(this.profileData));
        this.showNotification('Профиль успешно обновлен', 'success');
    }

    // Обновление UI
    updateUI() {
        // Основные данные
        document.getElementById('displayName').textContent = this.profileData.displayName;
        document.getElementById('userEmail').textContent = this.profileData.email;
        document.getElementById('profileDescription').textContent = this.profileData.description;
        document.getElementById('avatarPreview').src = this.profileData.avatar;
        
        // Статистика
        document.getElementById('postsCount').textContent = this.profileData.postsCount;
        document.getElementById('viewsCount').textContent = this.profileData.viewsCount;
        
        // Настройки
        document.getElementById('notificationsToggle').checked = this.profileData.notifications;
        document.getElementById('privacyToggle').checked = this.profileData.privacy;
        
        // Обновление данных в шапке
        document.getElementById('headerNickname').textContent = this.profileData.displayName;
        document.getElementById('headerAvatar').src = this.profileData.avatar;
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Загрузка аватара
        document.getElementById('avatarInput').addEventListener('change', (e) => this.handleAvatarUpload(e));
        
        // Открытие модального окна
        document.getElementById('editProfileModal').addEventListener('show.bs.modal', () => {
            document.getElementById('editDisplayName').value = this.profileData.displayName;
            document.getElementById('editEmail').value = this.profileData.email;
            document.getElementById('editDescription').value = this.profileData.description;
        });
        
        // Сохранение профиля
        document.getElementById('saveProfileButton').addEventListener('click', () => this.handleProfileSave());
        
        // Настройки
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
    handleProfileSave() {
        const newDisplayName = document.getElementById('editDisplayName').value.trim();
        const newEmail = document.getElementById('editEmail').value.trim();
        const newDescription = document.getElementById('editDescription').value.trim();
        const editAvatarInput = document.getElementById('editAvatar');
        const newAvatarFile = editAvatarInput.files[0];
        
        if (!newDisplayName || !newEmail) {
            this.showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        // Если выбран новый аватар, читаем его и сохраняем, иначе сохраняем остальные поля сразу
        if (newAvatarFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.profileData.avatar = e.target.result;
                this.profileData.displayName = newDisplayName;
                this.profileData.email = newEmail;
                this.profileData.description = newDescription;
                this.updateUI();
                this.saveProfile();
                // Сбросить поле выбора файла, чтобы можно было выбрать то же фото снова при необходимости
                editAvatarInput.value = '';
                // Закрываем модальное окно
                $('#editProfileModal').modal('hide');
            };
            reader.readAsDataURL(newAvatarFile);
        } else {
            this.profileData.displayName = newDisplayName;
            this.profileData.email = newEmail;
            this.profileData.description = newDescription;
            this.updateUI();
            this.saveProfile();
            $('#editProfileModal').modal('hide');
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
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const profileManager = new ProfileManager();
});