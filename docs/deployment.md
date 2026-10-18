# Публикация на VPS

Домен: `yaroslavdevelopment.ru`, VPS: `89.104.65.132`, Ubuntu 26.04 LTS. Приложение работает через Docker Compose; наружу открыты порты Caddy 80 и 443, порт Next.js доступен только внутри Docker. Рабочий каталог: `/opt/yaroslav-portfolio`.

## Конфигурация

Файл `/etc/yaroslav-portfolio.env` на сервере (права `600`):

```ini
DOMAIN=yaroslavdevelopment.ru
SERVER_IP=89.104.65.132
SITE_URL=https://yaroslavdevelopment.ru
PROJECTS_SOURCE=supabase
SUPABASE_NETWORK_MODE=short-connections
NEXT_PUBLIC_SUPABASE_URL=https://szdlyerislynteomonou.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<публичный ключ проекта>
```

Режим `supabase` получает опубликованные проекты из базы при запросе страницы. Изменения из `/admin` появляются без пересборки. Снимок от 19 октября 2026 года в `src/content/published-projects.ts` сохранён как отдельный режим `PROJECTS_SOURCE=snapshot` для ручного отката. При ошибке базы автоматической подмены данных снимком нет.

Если проект снова недоступен, проверьте его статус в Supabase Dashboard: приостановленный проект тоже может возвращать NXDOMAIN и восстанавливается через Resume. `NEXT_PUBLIC_*` фиксируются при сборке, поэтому смена URL или публичного ключа требует пересборки. Приватный service-role ключ приложению не нужен. Настройка таблиц и прав описана в [admin-setup.md](admin-setup.md).

На этом VPS длинные ответы Supabase обрываются после первых килобайт. Отдельная смена IP, MTU, TLS или HTTP не устранила обрыв. Рабочая конфигурация сочетает MTU Docker 1450 (как у интерфейса VPS), короткие соединения и загрузку обложек частями. Режим `short-connections` использует свежие соединения для чтения JSON и до трёх попыток при сетевом сбое; операции изменения данных автоматически не повторяются. Контейнеры используют сеть `yaroslav-portfolio_backend`.

Публичные обложки отдаются через `/api/project-covers/<uuid>.<ext>`. Сервер загружает оригинал из Supabase стандартными HTTPS Range-запросами по 2048 байт, по четыре одновременно, с HTTP/1.1 и TLS 1.2 и проверкой сертификата. Проверяются размер, диапазон и неизменность ETag. Полностью загруженный файл атомарно сохраняется в `/app/.next/cache/portfolio-covers` внутри volume `yaroslav-portfolio_app_cache`; Next.js кеширует оптимизированные изображения в том же volume. Обложки при загрузке из админки получают новый UUID, поэтому замена автоматически создаёт новый URL. Холодная загрузка требует больше запросов к Storage; повторные используют кеш. Лимит оригинала — 5 МБ. Ни VPN, ни внешний прокси не используются.

После изменения URL или публичного ключа пересоберите образ. Переключение `SUPABASE_NETWORK_MODE` применяется при перезапуске контейнера. Авторизация и редактирование в админке выполняются браузером через Supabase с RLS; приватный ключ для этого не требуется.

## Автодеплой из GitHub

Репозиторий: [Cherepnya-Yaroslav/portfolio-v2](https://github.com/Cherepnya-Yaroslav/portfolio-v2). Каждый push в `main` запускает [Deploy portfolio](https://github.com/Cherepnya-Yaroslav/portfolio-v2/actions/workflows/deploy.yml). Вручную тот же процесс запускается кнопкой **Run workflow** в Actions на ветке `main`.

```sh
git add <изменённые файлы>
git commit -m "Описание изменений"
git push origin main
```

Workflow устанавливает зависимости, запускает ESLint, транспортные проверки и проверки отката, собирает приложение и проверяет TypeScript. После успешных проверок GitHub подключается к VPS отдельным пользователем `portfolio-deploy`. Его ключ хранится в repository secret `VPS_DEPLOY_KEY`, разрешает только команду `deploy <SHA>` и не даёт интерактивную оболочку или туннели. Ключ сервера закреплён в `deploy/ssh_known_hosts`. Пароль root и параметры Supabase в GitHub не передаются.

Сервер сам получает актуальный `main` из GitHub и собирает именно проверенный commit с конфигурацией из `/etc/yaroslav-portfolio.env`. Сначала новая версия проверяется в отдельном контейнере: RU/EN, проекты, админка и Range-загрузка видео. Затем обновляется основной контейнер и выполняется повторная проверка. При сбое после переключения восстанавливаются предыдущие исходники и образ. Сертификаты, данные Supabase и постоянный кеш остаются в прежних Docker volumes. Деплои выполняются последовательно; устаревший commit не заменяет более новый `main`.

Текущий SHA хранится в `/var/lib/yaroslav-portfolio-deploy/current-revision`; два последних набора исходников — в `releases` и `backups` в том же каталоге. Предыдущий рабочий образ отмечен `yaroslav-portfolio-app:rollback`. Скрипт деплоя установлен в `/usr/local/sbin/portfolio-deploy` и обновляется из успешно опубликованной версии. GitHub Actions показывает журнал проверки, сборки и публикации.

Первичная установка с новым отдельным Ed25519-ключом выполняется один раз от root: `bash deploy/install-autodeploy.sh /path/to/deployment-key.pub`. Приватную часть нужно сохранить только в `VPS_DEPLOY_KEY`. Для смены хоста также обновите адрес в workflow и проверенную запись `deploy/ssh_known_hosts`.

## Ручное обновление

Docker Engine и Compose устанавливаются из [официального apt-репозитория](https://docs.docker.com/engine/install/ubuntu/). Docker включён в автозапуск, контейнеры используют `restart: unless-stopped`. Для сборки на сервере с 2 ГБ памяти настроен 1 ГБ swap.

После загрузки актуальных исходников без `.env*`, `.git`, `node_modules` и `.next`:

```sh
cd /opt/yaroslav-portfolio
docker compose --env-file /etc/yaroslav-portfolio.env config --quiet
docker compose --env-file /etc/yaroslav-portfolio.env up -d --build --wait --wait-timeout 180
docker compose --env-file /etc/yaroslav-portfolio.env ps
```

Перед обновлением сохраняйте текущие исходники и ID рабочего образа. Не удаляйте Docker volumes с сертификатами при обновлениях.

При изменении имени Docker-сети пересоздайте оба контейнера: добавьте `--force-recreate` к команде `up`. Compose может сохранить у прежнего контейнера Caddy ссылку на удалённую сеть, даже если контейнер приложения уже обновлён.

## DNS и HTTPS

A-записи `@` и `www` должны указывать на `89.104.65.132`. AAAA на другой сервер быть не должно. Порты 80 и 443 должны быть доступны извне, время сервера — синхронизировано.

Caddy автоматически получает доверенный сертификат, перенаправляет HTTP на HTTPS и продлевает сертификаты до истечения срока. Данные ACME и сертификаты сохраняются в volume `yaroslav-portfolio_caddy_data`; конфигурация — в `yaroslav-portfolio_caddy_config`. Механизм описан в [документации Caddy](https://caddyserver.com/docs/automatic-https).

Проверки после публикации:

```sh
curl -I http://yaroslavdevelopment.ru
curl -I https://yaroslavdevelopment.ru/ru
curl -I https://www.yaroslavdevelopment.ru/en
docker compose --env-file /etc/yaroslav-portfolio.env logs --tail=80 caddy
```

Для диагностики контейнеров используйте `logs --tail=80 app` и `ps`. Сертификаты не нужно выпускать вручную через Certbot; за ними следит Caddy.

Регрессионные проверки транспорта: `npx playwright test --config playwright.transport.config.ts`. Они воспроизводят обрыв тела HTTP-ответа, проверяют полноту обложки, отказ при неверном диапазоне/ETag/размере, повтор чтения JSON и отсутствие повторного выполнения записей.
