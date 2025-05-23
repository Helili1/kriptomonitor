$(document).ready(function () {
  // Загрузка аватара в основном окне
  $("#avatarInput").change(function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#avatarPreview").attr("src", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Заполнение полей модального окна при открытии
  $("#editProfileModal").on("show.bs.modal", function () {
    $("#editDisplayName").val($("#displayName").text().trim());
    $("#editDescription").val($("#profileDescription").text().trim());
    $("#editAvatar").val("");
  });

  // Сохранение изменений профиля
  $("#saveProfileButton").click(function () {
    const newDisplayName = $("#editDisplayName").val();
    const newDescription = $("#editDescription").val();
    const newAvatarFile = $("#editAvatar")[0].files[0];

    // Обновляем отображаемое имя
    if (newDisplayName.trim()) {
      $("#displayName").text(newDisplayName);
    }

    // Обновляем описание
    if (newDescription.trim()) {
      $("#profileDescription").text(newDescription);
    }

    // Обновляем аватар (если файл был выбран)
    if (newAvatarFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#avatarPreview").attr("src", e.target.result);
        $("#avatarInput").val(""); // Сбрасываем input в основном окне
      };
      reader.readAsDataURL(newAvatarFile);
    }

    // Показываем уведомление
    const toast = `<div class="alert alert-success fade show position-fixed" 
                  style="bottom: 20px; right: 20px; z-index: 1000; min-width: 250px;">
                  <i class="fas fa-check-circle mr-2"></i> Профиль обновлен
                  </div>`;
    $("body").append(toast);
    setTimeout(() => $(".alert").alert("close"), 3000);

    // Закрываем модальное окно
    $("#editProfileModal").modal("hide");
  });
});