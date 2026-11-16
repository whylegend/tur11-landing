# Публикация TUR11 через GitHub Pages

В проект уже добавлен workflow `.github/workflows/deploy-pages.yml`. Он публикует сайт при каждом `push` в ветку `main`.

## Первый запуск

1. На GitHub создайте **пустой публичный** репозиторий, например `tur11-landing`. Не добавляйте README, `.gitignore` или лицензию на сайте GitHub: они уже есть локально.
2. В репозитории откройте **Settings → Pages** и в поле **Build and deployment → Source** выберите **GitHub Actions**.
3. Передайте мне HTTPS-адрес нового репозитория, например `https://github.com/<ваш-аккаунт>/tur11-landing.git`, либо войдите в GitHub на этом компьютере. После этого можно будет отправить текущий проект в репозиторий.
4. После первого push откройте вкладку **Actions** и дождитесь успешного workflow `Deploy TUR11 to GitHub Pages`.

## Адрес политики

Если репозиторий называется `tur11-landing`, его адрес будет таким:

```text
https://<ваш-аккаунт>.github.io/tur11-landing/privacy.html
```

Именно этот постоянный URL используйте в RuStore. Если репозиторий будет называться `<ваш-аккаунт>.github.io`, адрес политики будет короче:

```text
https://<ваш-аккаунт>.github.io/privacy.html
```

## Состав публикации

- `index.html` — лендинг с маркированными партнёрскими ссылками 18+;
- `privacy.html` — самостоятельная страница политики конфиденциальности;
- `downloads/tur11-0.4.0-android.apk` — текущая тестовая Android-сборка;
- `.github/workflows/deploy-pages.yml` — автоматическая публикация GitHub Pages.

Файл `_headers` оставлен для Cloudflare-архива, но GitHub Pages его не применяет.
