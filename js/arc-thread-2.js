const THREAD_KEY = 'thread-arc-2';
const threadData = {
  title: 'Новости: Биткоин обновил максимум',
  category: 'Новости',
  author: 'NewsBot',
  date: '1 час назад',
  tags: ['биткоин', 'новости'],
  posts: [
    {
      author: 'NewsBot',
      avatar: '../assets/img/avatar_profile.png',
      date: '1 час назад',
      text: 'BTC превысил $70 000. Что это значит для рынка? Мнения экспертов и прогнозы...'
    },
    {
      author: 'CryptoFan',
      avatar: '../assets/img/avatar_profile.png',
      date: '50 мин назад',
      text: 'Считаю, что это начало нового бычьего тренда!'
    },
    {
      author: 'TraderPro',
      avatar: '../assets/img/avatar_profile.png',
      date: '30 мин назад',
      text: 'Возможно, но не забывайте про коррекции.'
    }
  ]
};

function getThreadPosts() {
  const saved = localStorage.getItem(THREAD_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return threadData.posts;
}

function saveThreadPosts(posts) {
  localStorage.setItem(THREAD_KEY, JSON.stringify(posts));
}

function renderPosts() {
  const posts = getThreadPosts();
  const postsContainer = document.getElementById('threadPosts');
  postsContainer.innerHTML = '';
  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post-card';
    div.innerHTML = `
      <img src="${post.avatar}" alt="avatar" class="post-avatar">
      <div class="post-content">
        <div class="post-header">
          <span class="post-author">${post.author}</span>
          <span class="post-date">${post.date}</span>
        </div>
        <div class="post-text">${post.text}</div>
        <div class="post-actions">
          <span>Ответить</span>
          <span>Пожаловаться</span>
        </div>
      </div>
    `;
    postsContainer.appendChild(div);
  });
  renderSidebar(posts);
}

function renderSidebar(posts) {
  document.getElementById('sidebarInfo').innerHTML = `
    <li><i class="far fa-comment"></i> Сообщений: <b>${posts.length}</b></li>
    <li><i class="far fa-eye"></i> Просмотров: <b>210</b></li>
    <li><i class="fas fa-users"></i> Участников: <b>${[...new Set(posts.map(p=>p.author))].length}</b></li>
  `;
  const users = [...new Set(posts.map(p => p.author))];
  document.getElementById('sidebarUsers').innerHTML = users.map(u => `<li><img src="../assets/img/avatar_profile.png" class="sidebar-avatar"> ${u}</li>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderPosts();
  document.getElementById('replyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const textarea = document.getElementById('replyTextarea');
    const text = textarea.value.trim();
    if (!text) return;
    const newPost = {
      author: 'Вы',
      avatar: '../assets/img/avatar_profile.png',
      date: 'только что',
      text
    };
    const posts = getThreadPosts();
    posts.push(newPost);
    saveThreadPosts(posts);
    textarea.value = '';
    renderPosts();
  });
}); 