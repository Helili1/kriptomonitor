// Демо-данные тем форума
const demoTopics = [
  {
    title: 'Как выбрать криптовалюту для инвестиций?',
    category: 'Криптовалюты',
    author: 'CryptoFan',
    date: '2 часа назад',
    preview: 'Обсуждаем критерии выбора перспективных монет, делимся опытом и советами для новичков...',
    replies: 12,
    views: 340,
    lastReply: '15 мин назад',
    tags: ['биткоин', 'инвестиции']
  },
  {
    title: 'Новости: Биткоин обновил максимум',
    category: 'Новости',
    author: 'NewsBot',
    date: '1 час назад',
    preview: 'BTC превысил $70 000. Что это значит для рынка? Мнения экспертов и прогнозы...',
    replies: 8,
    views: 210,
    lastReply: '5 мин назад',
    tags: ['биткоин', 'новости']
  },
  {
    title: 'Лучшие биржи для трейдинга в 2024',
    category: 'Трейдинг',
    author: 'TraderPro',
    date: '3 часа назад',
    preview: 'Сравниваем популярные биржи, комиссии, безопасность и удобство...',
    replies: 5,
    views: 120,
    lastReply: '1 мин назад',
    tags: ['трейдинг', 'биржи']
  },
  {
    title: 'Технологии блокчейна: что нового?',
    category: 'Технологии',
    author: 'Techie',
    date: '4 часа назад',
    preview: 'Обсуждаем свежие разработки и тренды в мире блокчейна...',
    replies: 3,
    views: 80,
    lastReply: '10 мин назад',
    tags: ['технологии', 'блокчейн']
  },
  {
    title: 'Стоит ли покупать альткоины сейчас?',
    category: 'Криптовалюты',
    author: 'AltHunter',
    date: '5 часов назад',
    preview: 'Мнения и прогнозы по альткоинам на ближайший год...',
    replies: 7,
    views: 150,
    lastReply: '20 мин назад',
    tags: ['альткоины', 'инвестиции']
  },
  {
    title: 'Общий чат',
    category: 'Прочее',
    author: 'JustUser',
    date: '6 часов назад',
    preview: 'Общаемся на любые темы, не обязательно про крипту!',
    replies: 20,
    views: 500,
    lastReply: '2 мин назад',
    tags: ['прочее']
  }
];

let filteredTopics = [...demoTopics];
let currentPage = 1;
const topicsPerPage = 4;

function getAllTopics() {
  // Сначала пробуем localStorage
  if (localStorage.getItem('forumTopics')) {
    try {
      const arr = JSON.parse(localStorage.getItem('forumTopics'));
      if (Array.isArray(arr)) return arr;
    } catch {}
  }
  // Fallback на demoTopics
  return demoTopics;
}

function renderTopics() {
  // Получаем актуальный список тем
  filteredTopics = getAllTopics().filter(topic => {
    const search = document.getElementById('searchInput').value.trim().toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    let matchesCategory = false;
    if (category === 'all') matchesCategory = true;
    else if (category === 'my') matchesCategory = topic.author === 'Вы';
    else matchesCategory = topic.category.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      topic.title.toLowerCase().includes(search) ||
      topic.author.toLowerCase().includes(search) ||
      topic.preview.toLowerCase().includes(search) ||
      (topic.tags && topic.tags.some(tag => tag.toLowerCase().includes(search)));
    return matchesCategory && matchesSearch;
  });
  // Сортировка и пагинация остаются прежними
  const list = document.getElementById('topicsList');
  list.innerHTML = '';
  const start = (currentPage - 1) * topicsPerPage;
  const end = start + topicsPerPage;
  const topicsToShow = filteredTopics.slice(start, end);
  if (topicsToShow.length === 0) {
    list.innerHTML = '<li class="text-center text-muted py-5">Темы не найдены</li>';
    return;
  }
  topicsToShow.forEach(topic => {
    const li = document.createElement('li');
    li.className = 'topic-card';
    // Универсальная ссылка на ветку
    const threadHref = `arc-thread.html?id=${topic.id}`;
    let editBtns = '';
    if (topic.author === 'Вы') {
      editBtns = `<div class="topic-actions mt-2">
        <button class="btn btn-sm btn-outline-primary edit-topic-btn" data-id="${topic.id}"><i class="fas fa-edit"></i> Редактировать</button>
        <button class="btn btn-sm btn-outline-danger delete-topic-btn" data-id="${topic.id}"><i class="fas fa-trash"></i> Удалить</button>
      </div>`;
    }
    li.innerHTML = `
      <div class="topic-main">
        <div class="topic-title"><a href="${threadHref}">${topic.title}</a></div>
        <div class="topic-meta">
          <span class="topic-category">${topic.category}</span>
          <span class="topic-author"><i class="fas fa-user"></i> <b>${topic.author}</b></span>
          <span class="topic-date"><i class="far fa-clock"></i> ${topic.date}</span>
        </div>
        <div class="topic-preview">${topic.preview}</div>
        <div class="topic-tags mt-2">
          ${(topic.tags||[]).map(tag => `<span class="tag" data-tag="${tag}">#${tag}</span>`).join(' ')}
        </div>
        ${editBtns}
      </div>
      <div class="topic-stats">
        <span title="Ответы"><i class="far fa-comment"></i> ${topic.replies}</span>
        <span title="Просмотры"><i class="far fa-eye"></i> ${topic.views}</span>
        <span title="Последний ответ"><i class="fas fa-arrow-right"></i> ${topic.lastReply}</span>
      </div>
    `;
    list.appendChild(li);
  });
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredTopics.length / topicsPerPage);
  const pagination = document.querySelector('.forum-pagination .pagination');
  if (!pagination) return;
  pagination.innerHTML = '';
  pagination.appendChild(createPageItem('Назад', currentPage === 1, () => {
    if (currentPage > 1) {
      currentPage--;
      renderTopics();
    }
  }));
  for (let i = 1; i <= totalPages; i++) {
    pagination.appendChild(createPageItem(i, currentPage === i, () => {
      currentPage = i;
      renderTopics();
    }));
  }
  pagination.appendChild(createPageItem('Вперёд', currentPage === totalPages, () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTopics();
    }
  }));
}

function createPageItem(label, disabled, onClick) {
  const li = document.createElement('li');
  li.className = 'page-item' + (disabled ? ' disabled' : '') + (typeof label === 'number' && disabled ? ' active' : '');
  const a = document.createElement('a');
  a.className = 'page-link';
  a.href = '#';
  a.textContent = label;
  a.onclick = (e) => {
    e.preventDefault();
    if (!disabled) onClick();
  };
  li.appendChild(a);
  return li;
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortFilter').value;
  filteredTopics = demoTopics.filter(topic => {
    const matchesCategory = category === 'all' || topic.category.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      topic.title.toLowerCase().includes(search) ||
      topic.author.toLowerCase().includes(search) ||
      topic.preview.toLowerCase().includes(search) ||
      topic.tags.some(tag => tag.toLowerCase().includes(search));
    return matchesCategory && matchesSearch;
  });
  // Сортировка
  if (sort === 'newest') {
    // По умолчанию demoTopics уже отсортированы по новизне
  } else if (sort === 'active') {
    filteredTopics.sort((a, b) => b.replies - a.replies);
  } else if (sort === 'popular') {
    filteredTopics.sort((a, b) => b.views - a.views);
  } else if (sort === 'oldest') {
    filteredTopics.reverse();
  }
  currentPage = 1;
  renderTopics();
}

// Добавляем демо-данные при первой загрузке
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем, есть ли уже темы в localStorage
  if (!localStorage.getItem('forumTopics')) {
    const demoTopics = [
      {
        id: 'demo1',
        title: 'Как начать инвестировать в криптовалюту?',
        category: 'Инвестиции',
        author: 'Эксперт',
        date: '2024-03-15',
        content: 'Криптовалютный рынок предлагает множество возможностей для инвестиций. Вот основные шаги для начинающих:\n\n1. Изучите основы блокчейна и криптовалют\n2. Выберите надежную биржу\n3. Начните с малых сумм\n4. Диверсифицируйте портфель\n5. Используйте холодное хранение',
        tags: ['инвестиции', 'новичкам', 'советы'],
        replies: [
          {
            author: 'Алексей',
            date: '2024-03-16',
            content: 'Отличная статья! Хотелось бы узнать больше о холодном хранении.'
          }
        ]
      },
      {
        id: 'demo2',
        title: 'Анализ перспектив DeFi в 2024 году',
        category: 'DeFi',
        author: 'Аналитик',
        date: '2024-03-14',
        content: 'DeFi продолжает развиваться быстрыми темпами. Основные тренды 2024 года:\n\n1. Рост TVL в протоколах\n2. Новые механизмы обеспечения безопасности\n3. Интеграция с традиционными финансами\n4. Развитие кросс-чейн решений',
        tags: ['defi', 'анализ', 'тренды'],
        replies: []
      },
      {
        id: 'demo3',
        title: 'Обзор новых NFT-проектов',
        category: 'NFT',
        author: 'Коллекционер',
        date: '2024-03-13',
        content: 'В этом месяце появилось несколько интересных NFT-проектов:\n\n1. Digital Art Gallery - платформа для цифровых художников\n2. GameFi Heroes - игра с NFT-персонажами\n3. Real Estate Tokens - токенизация недвижимости',
        tags: ['nft', 'обзор', 'проекты'],
        replies: [
          {
            author: 'Мария',
            date: '2024-03-13',
            content: 'Очень интересно про Real Estate Tokens. Можете подробнее рассказать?'
          }
        ]
      }
    ];
    localStorage.setItem('forumTopics', JSON.stringify(demoTopics));
  }

  renderTopics();
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('categoryFilter').addEventListener('change', applyFilters);
  document.getElementById('sortFilter').addEventListener('change', applyFilters);
  document.getElementById('searchBtn').addEventListener('click', (e) => {
    e.preventDefault();
    applyFilters();
  });
  // Кликабельные теги
  document.getElementById('topicsList').addEventListener('click', (e) => {
    if (e.target.classList.contains('tag')) {
      document.getElementById('searchInput').value = e.target.dataset.tag;
      applyFilters();
    }
  });
  // Добавляем пункт 'Мои темы' в фильтр категорий, если его нет
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter && !Array.from(categoryFilter.options).some(opt => opt.value === 'my')) {
    const myOpt = document.createElement('option');
    myOpt.value = 'my';
    myOpt.textContent = 'Мои темы';
    categoryFilter.insertBefore(myOpt, categoryFilter.firstChild.nextSibling); // после 'Все категории'
  }
  // Делегирование событий для кнопок редактирования и удаления темы
  document.getElementById('topicsList').addEventListener('click', function(e) {
    // Открыть модалку удаления
    if (e.target.closest('.delete-topic-btn')) {
      topicToDeleteId = e.target.closest('.delete-topic-btn').dataset.id;
      $('#deleteTopicModal').modal('show');
    }
    // Открыть модалку редактирования
    if (e.target.closest('.edit-topic-btn')) {
      topicToEditId = e.target.closest('.edit-topic-btn').dataset.id;
      let topics = getAllTopics();
      const idx = topics.findIndex(t => String(t.id) === String(topicToEditId));
      if (idx !== -1) {
        const t = topics[idx];
        document.getElementById('editTopicTitle').value = t.title;
        document.getElementById('editTopicCategory').value = t.category;
        // Получаем текст первого сообщения из thread-arc-N
        let msg = '';
        try {
          const posts = JSON.parse(localStorage.getItem(`thread-arc-${t.id}`));
          if (Array.isArray(posts) && posts[0]) msg = posts[0].text;
        } catch {}
        document.getElementById('editTopicMessage').value = msg;
        document.getElementById('editTopicTags').value = (t.tags||[]).join(', ');
        $('#editTopicModal').modal('show');
      }
    }
  });
  // Подтверждение удаления
  if (document.getElementById('confirmDeleteBtn')) {
    document.getElementById('confirmDeleteBtn').onclick = function() {
      if (topicToDeleteId) {
        let topics = getAllTopics();
        topics = topics.filter(t => String(t.id) !== String(topicToDeleteId));
        localStorage.setItem('forumTopics', JSON.stringify(topics));
        localStorage.removeItem(`thread-arc-${topicToDeleteId}`);
        renderTopics();
        $('#deleteTopicModal').modal('hide');
        topicToDeleteId = null;
      }
    };
  }
  // Сохранение редактирования
  if (document.getElementById('saveEditTopicBtn')) {
    document.getElementById('saveEditTopicBtn').onclick = function() {
      if (topicToEditId) {
        let topics = getAllTopics();
        const idx = topics.findIndex(t => String(t.id) === String(topicToEditId));
        if (idx !== -1) {
          const t = topics[idx];
          t.title = document.getElementById('editTopicTitle').value.trim();
          t.category = document.getElementById('editTopicCategory').value;
          t.tags = document.getElementById('editTopicTags').value.split(',').map(s=>s.replace(/[#\s]+/g,'').trim()).filter(Boolean);
          // Обновляем preview
          const msg = document.getElementById('editTopicMessage').value.trim();
          t.preview = msg.length > 100 ? msg.slice(0, 100) + '...' : msg;
          localStorage.setItem('forumTopics', JSON.stringify(topics));
          // Обновляем первое сообщение ветки
          let posts = [];
          try {
            posts = JSON.parse(localStorage.getItem(`thread-arc-${t.id}`)) || [];
          } catch {}
          if (posts[0]) {
            posts[0].text = msg;
            localStorage.setItem(`thread-arc-${t.id}`, JSON.stringify(posts));
          }
          renderTopics();
          $('#editTopicModal').modal('hide');
          topicToEditId = null;
        }
      }
    };
  }
});

// 1. Всплывающее окно-уведомление для удаления темы
// Добавим разметку модального окна в конец body (если его нет)
if (!document.getElementById('deleteTopicModal')) {
  const modalHtml = `
    <div class="modal fade" id="deleteTopicModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Удаление темы</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Вы действительно хотите удалить эту тему? Это действие необратимо.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Отмена</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Удалить</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// 2. Модальное окно для редактирования темы (все параметры)
if (!document.getElementById('editTopicModal')) {
  const modalHtml = `
    <div class="modal fade" id="editTopicModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Редактировать тему</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form id="editTopicForm">
              <div class="form-group">
                <label for="editTopicTitle">Заголовок темы</label>
                <input type="text" id="editTopicTitle" class="form-control" required />
              </div>
              <div class="form-group">
                <label for="editTopicCategory">Категория</label>
                <select id="editTopicCategory" class="form-control" required>
                  <option value="Криптовалюты">Криптовалюты</option>
                  <option value="Новости">Новости</option>
                  <option value="Трейдинг">Трейдинг</option>
                  <option value="Технологии">Технологии</option>
                  <option value="Прочее">Прочее</option>
                </select>
              </div>
              <div class="form-group">
                <label for="editTopicMessage">Сообщение</label>
                <textarea id="editTopicMessage" class="form-control" rows="4" required></textarea>
              </div>
              <div class="form-group">
                <label for="editTopicTags">Теги (через запятую)</label>
                <input type="text" id="editTopicTags" class="form-control" />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Отмена</button>
            <button type="button" class="btn btn-primary" id="saveEditTopicBtn">Сохранить</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// 4. Логика для открытия/закрытия и работы модальных окон
let topicToDeleteId = null;
let topicToEditId = null; 