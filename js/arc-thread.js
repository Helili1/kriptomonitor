// Универсальный JS для ветки форума
// Получение id темы из query-параметра
function getThreadId() {
  const url = new URL(window.location.href);
  return url.searchParams.get('id');
}

// Получение всех тем (из localStorage или demoTopics)
function getAllTopics() {
  if (localStorage.getItem('forumTopics')) {
    try {
      const arr = JSON.parse(localStorage.getItem('forumTopics'));
      if (Array.isArray(arr)) return arr;
    } catch {}
  }
  if (window.demoTopics) return window.demoTopics;
  return [];
}

// Получение данных темы по id
function getThreadData(id) {
  const topics = getAllTopics();
  return topics.find(t => String(t.id) === String(id));
}

// Получение сообщений ветки по id
function getThreadPosts(id) {
  const key = `thread-arc-${id}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  // Fallback: если тема из demoTopics, берем стартовое сообщение
  const thread = getThreadData(id);
  if (thread && thread.preview) {
    return [{
      author: thread.author,
      avatar: '../assets/img/avatar_profile.png',
      date: thread.date,
      text: thread.preview
    }];
  }
  return [];
}

function saveThreadPosts(id, posts) {
  localStorage.setItem(`thread-arc-${id}`, JSON.stringify(posts));
}

function saveTopicData(id, newData) {
  const topics = getAllTopics();
  const idx = topics.findIndex(t => String(t.id) === String(id));
  if (idx !== -1) {
    topics[idx] = { ...topics[idx], ...newData };
    localStorage.setItem('forumTopics', JSON.stringify(topics));
  }
}

// Рендер шапки темы
function renderThreadHeader(thread) {
  const el = document.getElementById('threadHeader');
  if (!thread) {
    el.innerHTML = '<div class="text-danger">Тема не найдена</div>';
    return;
  }
  let editBtns = '';
  if (thread.author === 'Вы') {
    editBtns = `<div class="mt-2">
      <button class="btn btn-sm btn-outline-primary edit-topic-btn"><i class="fas fa-edit"></i> Редактировать тему</button>
      <button class="btn btn-sm btn-outline-danger delete-topic-btn"><i class="fas fa-trash"></i> Удалить тему</button>
    </div>`;
  }
  el.innerHTML = `
    <div class="thread-title">${thread.title}</div>
    <div class="thread-meta">
      <span class="thread-category">${thread.category}</span>
      <span class="thread-author"><i class="fas fa-user"></i> <b>${thread.author}</b></span>
      <span class="thread-date"><i class="far fa-clock"></i> ${thread.date}</span>
    </div>
    <div class="thread-tags">${(thread.tags||[]).map(tag => `<span class="thread-tag">#${tag}</span>`).join(' ')}</div>
    ${editBtns}
  `;
}

// Рендер сообщений
let editMsgIndex = null;
function renderPosts(id) {
  const posts = getThreadPosts(id);
  const postsContainer = document.getElementById('threadPosts');
  postsContainer.innerHTML = '';
  posts.forEach((post, idx) => {
    let actions = '';
    if (post.author === 'Вы') {
      actions = `<span class="edit-msg-btn" data-idx="${idx}"><i class="fas fa-edit"></i> Редактировать</span>
        <span class="delete-msg-btn text-danger" data-idx="${idx}"><i class="fas fa-trash"></i> Удалить</span>`;
    }
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
        <div class="post-actions">${actions}</div>
      </div>
    `;
    postsContainer.appendChild(div);
  });
  renderSidebar(id, posts);
}

// Рендер боковой панели
function renderSidebar(id, posts) {
  document.getElementById('sidebarInfo').innerHTML = `
    <li><i class="far fa-comment"></i> Сообщений: <b>${posts.length}</b></li>
    <li><i class="far fa-eye"></i> Просмотров: <b>${getThreadData(id)?.views || 0}</b></li>
    <li><i class="fas fa-users"></i> Участников: <b>${[...new Set(posts.map(p=>p.author))].length}</b></li>
  `;
  const users = [...new Set(posts.map(p => p.author))];
  document.getElementById('sidebarUsers').innerHTML = users.map(u => `<li><img src="../assets/img/avatar_profile.png" class="sidebar-avatar"> ${u}</li>`).join('');
  const tags = getThreadData(id)?.tags || [];
  document.getElementById('sidebarTags').innerHTML = tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ');
}

// Удаление темы
function deleteTopic(id) {
  if (!confirm('Удалить тему и все сообщения?')) return;
  let topics = getAllTopics();
  topics = topics.filter(t => String(t.id) !== String(id));
  localStorage.setItem('forumTopics', JSON.stringify(topics));
  localStorage.removeItem(`thread-arc-${id}`);
  window.location.href = 'forum.html';
}

// Редактирование темы
function editTopic(id) {
  const thread = getThreadData(id);
  if (!thread) return;
  const newTitle = prompt('Изменить заголовок темы:', thread.title);
  if (newTitle && newTitle.trim()) {
    saveTopicData(id, { title: newTitle.trim() });
    renderThreadHeader(getThreadData(id));
    document.title = newTitle.trim() + ' — Форум';
  }
}

// Удаление сообщения
function deleteMsg(id, idx) {
  if (!confirm('Удалить это сообщение?')) return;
  const posts = getThreadPosts(id);
  posts.splice(idx, 1);
  saveThreadPosts(id, posts);
  renderPosts(id);
}

// Редактирование сообщения
function editMsg(id, idx) {
  const posts = getThreadPosts(id);
  editMsgIndex = idx;
  document.getElementById('editTextarea').value = posts[idx].text;
  $('#editModal').modal('show');
}

function saveEditMsg(id) {
  const posts = getThreadPosts(id);
  if (editMsgIndex !== null && posts[editMsgIndex]) {
    posts[editMsgIndex].text = document.getElementById('editTextarea').value;
    saveThreadPosts(id, posts);
    renderPosts(id);
    $('#editModal').modal('hide');
    editMsgIndex = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const id = getThreadId();
  const thread = getThreadData(id);
  renderThreadHeader(thread);
  renderPosts(id);

  // Добавление сообщения
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
    const posts = getThreadPosts(id);
    posts.push(newPost);
    saveThreadPosts(id, posts);
    textarea.value = '';
    renderPosts(id);
  });

  // Делегирование событий для редактирования/удаления сообщений
  document.getElementById('threadPosts').addEventListener('click', function(e) {
    if (e.target.closest('.edit-msg-btn')) {
      const idx = e.target.closest('.edit-msg-btn').dataset.idx;
      editMsg(id, idx);
    }
    if (e.target.closest('.delete-msg-btn')) {
      const idx = e.target.closest('.delete-msg-btn').dataset.idx;
      deleteMsg(id, idx);
    }
  });

  // Сохранение редактирования сообщения
  document.getElementById('saveEditBtn').addEventListener('click', function() {
    saveEditMsg(id);
  });

  // Редактирование/удаление темы
  document.getElementById('threadHeader').addEventListener('click', function(e) {
    if (e.target.closest('.edit-topic-btn')) {
      editTopic(id);
    }
    if (e.target.closest('.delete-topic-btn')) {
      deleteTopic(id);
    }
  });
}); 