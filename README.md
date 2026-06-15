# Нейроархив обществознания

Интерактивный архив конспектов по обществознанию: стартовая сцена с ботом,
canvas-раскрытие проводника недель, spring-анимации папок и статьи в новом
JSON-блочном формате.

## Стек

- **Frontend:** Vite + React + TypeScript + TipTap
- **Backend:** Go + Chi + PostgreSQL
- **Reverse proxy:** Caddy
- **Deploy:** Docker Compose

## Команды

```bash
npm install
npm run dev       # локальная разработка фронта
npm run lint
npm run build     # production-сборка фронта в dist/
```

## Запуск всего стека

```bash
cp .env.example .env   # заполните JWT_SECRET и ADMIN_PASSWORD_HASH
./scripts/deploy.sh dev
# или для production:
# ./scripts/deploy.sh prod
```

После запуска:
- сайт: `http://localhost` или `http://${APP_DOMAIN}`
- API: `http://localhost/api/...`
- админка: длинный тап на правой «кнопке» окна архива или `Ctrl+Shift+A`

## Контент

Статьи хранятся в PostgreSQL в виде JSON-блоков. MDX-файлы из `src/content/notes`
импортируются через:

```bash
node scripts/migrate-mdx-to-json.mjs
```

Загруженные изображения сохраняются в `./data/uploads` и раздаются через
`/uploads/{filename}`.
