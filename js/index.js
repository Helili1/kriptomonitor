$(document).ready(function () {
  // Данные для разных источников
  const dataSources = {
    source1: [
      { name: "Bitcoin (BTC)", price: 30245, change: "+2.5%" },
      { name: "Ethereum (ETH)", price: 1980, change: "-1.2%" },
      { name: "Cardano (ADA)", price: 0.48, change: "+0.5%" },
      { name: "Solana (SOL)", price: 42, change: "+3.1%" },
      { name: "Polygon (MATIC)", price: 0.75, change: "-0.8%" }
    ],
    source2: [
      { name: "Bitcoin (BTC)", price: 30180, change: "+1.8%" },
      { name: "BNB (BNB)", price: 245, change: "+0.5%" },
      { name: "Ripple (XRP)", price: 0.52, change: "-0.3%" },
      { name: "Dogecoin (DOGE)", price: 0.065, change: "+2.5%" },
      { name: "Polkadot (DOT)", price: 5.2, change: "+1.1%" }
    ],
    source3: [
      { name: "Bitcoin (BTC)", price: 30310, change: "+2.1%" },
      { name: "Litecoin (LTC)", price: 85, change: "-1.5%" },
      { name: "Chainlink (LINK)", price: 14.5, change: "+0.8%" },
      { name: "Stellar (XLM)", price: 0.12, change: "+0.2%" },
      { name: "Uniswap (UNI)", price: 5.8, change: "-0.5%" }
    ]
  };

  // Функция заполнения таблицы
  function fillTable(data) {
    const cryptoTableBody = $("#cryptoTableBody");
    cryptoTableBody.empty(); // Очищаем таблицу
    
    data.forEach((crypto, index) => {
      const row = `<tr>
                <td>${index + 1}</td>
                <td>${crypto.name}</td>
                <td>${crypto.price}</td>
                <td class="${crypto.change.startsWith("+") ? "change-up" : "change-down"}">${crypto.change}</td>
            </tr>`;
      cryptoTableBody.append(row);
    });
  }

  // Инициализация таблицы при загрузке
  fillTable(dataSources.source1);

  // Обработчик изменения источника данных
  $("#dataSource").change(function() {
    const source = $(this).val();
    fillTable(dataSources[source]);
  });

  // Переменные для отслеживания направления сортировки
  let isAscendingPrice = true;
  let isAscendingName = true;
  let isAscendingChange = true;

  // Обработчик изменения сортировки
  $("#sortOption").change(function() {
    const sortType = $(this).val();
    
    if (sortType === "default") {
      const source = $("#dataSource").val();
      fillTable(dataSources[source]);
      return;
    }
    
    // Используем логику сортировки
    const rows = $("#cryptoTableBody tr").toArray();

    rows.sort((a, b) => {
      if (sortType === "price") {
        const aValue = parseFloat($(a).find("td:eq(2)").text().replace(",", ""));
        const bValue = parseFloat($(b).find("td:eq(2)").text().replace(",", ""));
        return isAscendingPrice ? aValue - bValue : bValue - aValue;
      } else if (sortType === "name") {
        const aValue = $(a).find("td:eq(1)").text();
        const bValue = $(b).find("td:eq(1)").text();
        return isAscendingName ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (sortType === "change") {
        const aValue = parseFloat($(a).find("td:eq(3)").text().replace("%", "").replace(",", "").trim());
        const bValue = parseFloat($(b).find("td:eq(3)").text().replace("%", "").replace(",", "").trim());
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
      $(row).children("td").first().text(index + 1);
    });
  });

  // Инициализация карусели новостей с отступами
  $(".news-carousel").slick({
    dots: false,
    infinite: true,
    slidesToShow: 3,
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
});