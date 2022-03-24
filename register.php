<?php include_once __DIR__ . '/api/utils/auth.php'; ?><!DOCTYPE html>
<html lang="pt-BR">
<head>
  <base href="/">
  <title>Registrar - Spozer</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="public/assets/images/icon.png">
  <link rel="stylesheet" href="public/assets/css/auth.css">
</head>
<body class="center">
  <header class="center noborder">
    <div class="logo small"></div>
  </header>

  <?php if (($ERROR_CODE ?? 200) != 200): ?>
    <div class="display-error auth">
      <div class="error">
        <span><?= $ERROR_CODE ?></span> <?= $ERROR_MESSAGE ?>.
      </div>
    </div>
  <?php endif; ?>

  <div class="form">
    <h2>Inscreva-se grátis e comece a curtir.</h2>

    <form action="/register" method="POST">
      <div>
        <label class="placeholder">
          <input type="email" name="email" required>
          <span>Endereço de email</span>
        </label>
      </div>

      <div>
        <label class="placeholder">
          <input type="password" name="password" min="6" required>
          <span>Senha</span>
        </label>
      </div>

      <div>
        <label class="placeholder">
          <input type="text" name="firstname" min="2" required>
          <span>Nome</span>
        </label>
      </div>

      <div>
        <label class="placeholder">
          <input type="text" name="lastname" min="2" required>
          <span>Sobrenome</span>
        </label>
      </div>

      <div style="margin-bottom: 20px;">
        <input type="checkbox" name="is_artist" style="display: none;">
        <div class="center" style="justify-content: flex-start">
          <span class="center checkbox"></span> Sou um artista
        </div>
      </div>

      <div id="artistic-name">
        <label class="placeholder">
          <input type="text" name="artistic_name" min="2" disabled>
          <span>Nome artístico</span>
        </label>
      </div>

      <div>
        <button class="btn register">Inscrever-se</button>
      </div>
    </form>

    <div class="title-line">
      <h4>Já tem uma conta?</h4>
    </div>

    <div class="center">
      <a href="/login">Fazer login</a>
    </div>
  </div>

  <script>
    /**
     * Controla o checkbox para mostrar e esconder o campo "nome artistico"
     */
    window.addEventListener('load', () => {
      const souArtista             = document.querySelector('span.checkbox')
      const souArtistaCheckbox     = document.querySelector('input[type="checkbox"]')
      const artisticNameContainer  = document.querySelector('#artistic-name')
      const artisticNameInput      = document.querySelector('input[name="artistic_name"]')

      souArtista.addEventListener('click', () => {
        souArtistaCheckbox.checked = artisticNameInput.required = souArtista.classList.toggle('checked')
        artisticNameInput.disabled = !artisticNameInput.required
        artisticNameContainer.style.display = artisticNameInput.disabled ? 'none' : 'block'
      })
    })
  </script>
</body>
</html>