<?php include_once __DIR__ . '/api/utils/auth.php'; ?><!DOCTYPE html>
<html lang="pt-BR">
<head>
  <base href="/">
  <title>Login - Spozer</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="public/assets/images/icon.png">
  <link rel="stylesheet" href="public/assets/css/auth.css">
</head>
<body class="center">
  <header class="center">
    <div class="logo"></div>
  </header>

  <?php if (($ERROR_CODE ?? 200) != 200): ?>
    <div class="display-error auth">
      <div class="error">
        <span><?= $ERROR_CODE ?></span> <?= $ERROR_MESSAGE ?>.
      </div>
    </div>
  <?php endif; ?>

  <div class="form">
    <h4>Para continuar, faça login no Spozer.</h4>

    <form action="<?= $CURRENT_URI ?>" method="POST">
      <div>
        <label class="placeholder">
          <input type="email" name="email" required>
          <span>Endereço de email</span>
        </label>
      </div>

      <div>
        <label class="placeholder">
          <input type="password" name="password" required>
          <span>Senha</span>
        </label>
      </div>

      <div class="login-btn">
        <div class="center">
          <span class="center checkbox checked"></span>
          Lembrar de mim  
        </div>

        <button class="btn">Entrar</button>
      </div>
    </form>

    <div class="title-line">
      <h4>Ainda não possui uma conta?</h4>
    </div>

    <div class="center">
      <a class="register" href="/register">Inscrever-se no Spozer</a>
    </div>
  </div>
</body>
</html>