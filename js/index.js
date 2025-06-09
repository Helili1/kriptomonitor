$(document).ready(function () {
  // Данные для разных источников
  const dataSources = {
    source1: [
      { name: "Bitcoin (BTC)", price: 30245, change: "+2.5%" },
      { name: "Ethereum (ETH)", price: 1980, change: "-1.2%" },
      { name: "Cardano (ADA)", price: 0.48, change: "+0.5%" },
      { name: "Solana (SOL)", price: 42, change: "+3.1%" },
      { name: "Polygon (MATIC)", price: 0.75, change: "-0.8%" },
    ],
    source2: [
      { name: "Bitcoin (BTC)", price: 30180, change: "+1.8%" },
      { name: "BNB (BNB)", price: 245, change: "+0.5%" },
      { name: "Ripple (XRP)", price: 0.52, change: "-0.3%" },
      { name: "Dogecoin (DOGE)", price: 0.065, change: "+2.5%" },
      { name: "Polkadot (DOT)", price: 5.2, change: "+1.1%" },
    ],
    source3: [
      { name: "Bitcoin (BTC)", price: 30310, change: "+2.1%" },
      { name: "Litecoin (LTC)", price: 85, change: "-1.5%" },
      { name: "Chainlink (LINK)", price: 14.5, change: "+0.8%" },
      { name: "Stellar (XLM)", price: 0.12, change: "+0.2%" },
      { name: "Uniswap (UNI)", price: 5.8, change: "-0.5%" },
    ],
  };

  const COINGECKO_API_KEY = 'CG-56kAjpNgMLX2KvXsAQtfdtDs'; // Ключ CoinGecko пользователя
  const COINMARKETCAP_API_KEY = 'b6bfa4b7-7e7e-4e7e-8e7e-7e7e7e7e7e7e'; // Демо-ключ, замените на свой
  const CRYPTOCOMPARE_API_KEY = 'bb4039ed8dd766e676e5fbb71a7a26f280c1466bf3a899c4f0d48103ac7cdd7a';

  async function fetchFromCoinGecko() {
    const url = 'https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';
    const res = await fetch(url, {
      headers: {
        'x-cg-pro-api-key': COINGECKO_API_KEY
      }
    });
    if (!res.ok) throw new Error('Ошибка CoinGecko');
    return await res.json();
  }

  async function fetchFromCoinMarketCap() {
    const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=10&convert=USD';
    const res = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY
      }
    });
    if (!res.ok) throw new Error('Ошибка CoinMarketCap');
    const data = await res.json();
    return data.data;
  }

  async function fetchFromCryptoCompare() {
    const url = 'https://min-api.cryptocompare.com/data/top/mktcapfull?limit=10&tsym=USD';
    const res = await fetch(url, {
      headers: {
        'authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
      }
    });
    if (!res.ok) throw new Error('Ошибка CryptoCompare');
    const data = await res.json();
    return data.Data;
  }

  // Функция заполнения таблицы
  function fillTable(data, source) {
    const cryptoTableBody = $("#cryptoTableBody");
    cryptoTableBody.empty(); // Очищаем таблицу
    data.forEach((item, index) => {
      let name, price, change;
      if (source === 'source1') { // CoinGecko
        name = (item?.name || '-') + ' (' + (item?.symbol ? item.symbol.toUpperCase() : '-') + ')';
        price = item?.current_price !== undefined ? item.current_price : '-';
        change = (item?.price_change_percentage_24h !== undefined)
          ? ((item.price_change_percentage_24h > 0 ? '+' : '') + item.price_change_percentage_24h.toFixed(2) + '%')
          : '-';
      } else if (source === 'source2') { // CoinMarketCap
        name = (item?.name || '-') + ' (' + (item?.symbol || '-') + ')';
        price = item?.quote?.USD?.price !== undefined ? item.quote.USD.price.toFixed(2) : '-';
        change = (item?.quote?.USD?.percent_change_24h !== undefined)
          ? ((item.quote.USD.percent_change_24h > 0 ? '+' : '') + item.quote.USD.percent_change_24h.toFixed(2) + '%')
          : '-';
      } else if (source === 'source3') { // CryptoCompare
        name = (item?.CoinInfo?.FullName || '-') + ' (' + (item?.CoinInfo?.Name || '-') + ')';
        price = item?.RAW?.USD?.PRICE !== undefined ? item.RAW.USD.PRICE.toFixed(2) : '-';
        change = item?.RAW?.USD?.CHANGEPCT24HOUR !== undefined
          ? ((item.RAW.USD.CHANGEPCT24HOUR > 0 ? '+' : '') + item.RAW.USD.CHANGEPCT24HOUR.toFixed(2) + '%')
          : '-';
      }
      const row = `<tr>
                <td>${index + 1}</td>
                <td>${name}</td>
                <td>${price}</td>
                <td class="${
                  change.startsWith("+") ? "change-up" : "change-down"
                }">${change}</td>
            </tr>`;
      cryptoTableBody.append(row);
    });
  }

  // Инициализация таблицы при загрузке
  fillTable(dataSources.source1, 'source1');

  // Обработчик изменения источника данных
  $("#dataSource").change(function () {
    const source = $(this).val();
    updateTable(source);
  });

  // Переменные для отслеживания направления сортировки
  let isAscendingPrice = true;
  let isAscendingName = true;
  let isAscendingChange = true;

  // Обработчик изменения сортировки
  $("#sortOption").change(function () {
    const sortType = $(this).val();

    if (sortType === "default") {
      const source = $("#dataSource").val();
      fillTable(dataSources[source], source);
      return;
    }

    // Используем логику сортировки
    const rows = $("#cryptoTableBody tr").toArray();

    rows.sort((a, b) => {
      if (sortType === "price") {
        const aValue = parseFloat(
          $(a).find("td:eq(2)").text().replace(",", "")
        );
        const bValue = parseFloat(
          $(b).find("td:eq(2)").text().replace(",", "")
        );
        return isAscendingPrice ? aValue - bValue : bValue - aValue;
      } else if (sortType === "name") {
        const aValue = $(a).find("td:eq(1)").text();
        const bValue = $(b).find("td:eq(1)").text();
        return isAscendingName
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (sortType === "change") {
        const aValue = parseFloat(
          $(a).find("td:eq(3)").text().replace("%", "").replace(",", "").trim()
        );
        const bValue = parseFloat(
          $(b).find("td:eq(3)").text().replace("%", "").replace(",", "").trim()
        );
        return isAscendingChange ? aValue - bValue : bValue - aValue;
      }
    });

    // Меняем направление сортировки
    if (sortType === "price") {
      isAscendingPrice = !isAscendingPrice;
    } else if (sortType === "name") {
      isAscendingName = !isAscendingName;
    } else if (sortType === "change") {
      isAscendingChange = !isAscendingChange;
    }

    $("#cryptoTableBody").empty().append(rows);

    // Обновляем индексы
    $("#cryptoTableBody tr").each((index, row) => {
      $(row)
        .children("td")
        .first()
        .text(index + 1);
    });
  });

  // Инициализация карусели новостей с отступами
  $(".news-carousel").slick({
    dots: false,
    infinite: true,
    slidesToShow: 2,
    slidesToScroll: 1,
    prevArrow: '<button type="button" class="slick-prev"></button>',
    nextArrow: '<button type="button" class="slick-next"></button>',
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });

  // Обработчик клика по ссылке "Зарегистрироваться"
  $("#registerModal").on("shown.bs.modal", function () {
    $("#email").focus();
  });

  // Обработчик кнопки "Зарегистрироваться"
  $("#registerButton").click(function () {
    let email = $("#email").val();
    let displayName = $("#displayName").val();
    let password = $("#registerPassword").val();
    let confirmPassword = $("#confirmPassword").val();
    let errorContainer = $("#registerError");

    // Сброс предыдущих ошибок
    errorContainer.hide().text("");

    // Валидация данных
    if (!email || !displayName || !password || !confirmPassword) {
      errorContainer.text("Пожалуйста, заполните все поля.").show();
      return;
    }

    if (password !== confirmPassword) {
      errorContainer.text("Пароли не совпадают.").show();
      return;
    }

    if (password.length < 6) {
      errorContainer.text("Пароль должен быть не менее 6 символов").show();
      return;
    }

    // Имитация успешной регистрации
    setTimeout(function () {
      $("#registerModal").modal("hide");
      alert("Регистрация прошла успешно!");
      $("#registrationForm")[0].reset();
    }, 1000);
  });

  async function updateTable(source) {
    try {
      let data = [];
      if (source === 'source1') data = await fetchFromCoinGecko();
      if (source === 'source2') data = await fetchFromCoinMarketCap();
      if (source === 'source3') data = await fetchFromCryptoCompare();
      fillTable(data, source);
    } catch (e) {
      $("#cryptoTableBody").html(`<tr><td colspan="4">Ошибка загрузки данных: ${e.message}</td></tr>`);
    }
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // --- Универсальный бургер-меню ---
  const burgerMenu = document.querySelector('.burger-menu');
  const headerRight = document.querySelector('.header__right');
  if (burgerMenu && headerRight) {
    burgerMenu.addEventListener('click', function(e) {
      this.classList.toggle('active');
      headerRight.classList.toggle('active');
      document.body.classList.toggle('menu-open', this.classList.contains('active'));
      e.stopPropagation();
    });
    // Закрытие меню по клику вне меню или по затемнению
    document.addEventListener('click', function(e) {
      if (
        document.body.classList.contains('menu-open') &&
        !burgerMenu.contains(e.target) &&
        !headerRight.contains(e.target)
      ) {
        burgerMenu.classList.remove('active');
        headerRight.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }

  // --- Карусель новостей ---
  if (window.jQuery && $('.news-carousel').length) {
    $('.news-carousel').slick({
      dots: false,
      infinite: true,
      speed: 300,
      slidesToShow: 3,
      slidesToScroll: 1,
      prevArrow: '<button type="button" class="slick-prev" aria-label="Назад"><i class="fa fa-angle-left"></i></button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="Вперёд"><i class="fa fa-angle-right"></i></button>',
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });
    // Перемещаем стрелки вниз на мобильных/планшетах
    function moveArrowsIfMobile() {
      const arrows = document.querySelectorAll('.news-carousel .slick-arrow');
      const arrowsContainer = document.querySelector('.news-carousel-arrows');
      if (window.innerWidth <= 768 && arrowsContainer) {
        arrows.forEach(arrow => arrowsContainer.appendChild(arrow));
      } else {
        const carousel = document.querySelector('.news-carousel');
        arrows.forEach(arrow => carousel.appendChild(arrow));
      }
    }
    moveArrowsIfMobile();
    window.addEventListener('resize', moveArrowsIfMobile);
  }

  // --- Таблица криптовалют ---
  // (оставляю существующую логику, если есть)
});
