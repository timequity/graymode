# GrayMode — Product Requirements Document

## Overview

**GrayMode** — браузерное расширение для борьбы с прокрастинацией через grayscale фильтр.

**Бренд:** 0x7669 (Focus категория)

## Problem

- Doom-scrolling и прокрастинация на отвлекающих сайтах
- Яркие цвета стимулируют дофамин → сложно закрыть вкладку
- 68% remote workers отмечают улучшение ясности при использовании focus-расширений

## Solution

Grayscale фильтр снижает визуальную стимуляцию отвлекающих сайтов → легче вернуться к работе.

## Target Audience

- Remote workers
- Люди с проблемами концентрации
- Студенты
- Все кто борется с doom-scrolling

## MVP Features (v1.0)

- [x] Preset категории (Соцсети, Видео, Новости, Мессенджеры)
- [x] Ручной blacklist (5 сайтов бесплатно)
- [x] Slider интенсивности (50-100%, default 100%)
- [x] Icon toggle (вкл/выкл)
- [x] Автоматический режим по списку сайтов
- [ ] Тестирование в Chrome
- [ ] Иконки
- [ ] Публикация в Chrome Web Store

## v2 Features (Pro)

- [ ] Безлимитный blacklist
- [ ] AI detection отвлекающего контента
- [ ] Статистика времени в фокусе
- [ ] Расписание (рабочие часы)
- [ ] Sync между устройствами

## Monetization

**Freemium:**
- Free: preset категории, 5 сайтов в blacklist, slider
- Pro ($3 one-time): безлимит blacklist, AI detection, статистика, расписание, sync

## Preset Categories

### Social Media
- twitter.com, x.com
- facebook.com
- instagram.com
- tiktok.com
- linkedin.com
- threads.net

### Video
- youtube.com
- twitch.tv
- netflix.com
- vimeo.com
- dailymotion.com

### News & Forums
- reddit.com
- news.ycombinator.com
- cnn.com, bbc.com, nytimes.com

### Messengers
- web.telegram.org
- web.whatsapp.com
- discord.com
- slack.com
- messenger.com

## Technical Stack

- **Language:** TypeScript
- **Build:** esbuild
- **Manifest:** V3 (Chrome)
- **Storage:** chrome.storage.sync
- **Platforms:** Chrome (MVP), Firefox/Edge (v2)

## Architecture

```
src/
├── background.ts    # Service worker
├── content.ts       # Applies grayscale filter
├── presets.ts       # Category definitions
├── storage.ts       # Settings persistence
└── popup/
    ├── popup.html   # UI
    ├── popup.css    # Styles
    └── popup.ts     # Logic
```

## UX Decisions

1. **100% grayscale по умолчанию** — максимальный эффект сразу
2. **Категории off по умолчанию** — пользователь сам включает что хочет
3. **Мгновенное применение** — изменения видны сразу
4. **Dark theme popup** — соответствует теме фокуса

## Success Metrics

- 1000+ установок в первый месяц
- 4.5+ рейтинг в Chrome Web Store
- 10%+ conversion в Pro

## Competitors

| Конкурент | Недостаток |
|-----------|------------|
| Monochromate | Только on/off, нет smart режима |
| Forest | Геймификация, не grayscale |
| StayFree | Блокировка, не снижение стимуляции |

## Timeline

- [x] MVP разработка
- [ ] Тестирование (1-2 дня)
- [ ] Иконки и assets
- [ ] Chrome Web Store ($5 аккаунт)
- [ ] Публикация
- [ ] Сбор фидбека
- [ ] v2 planning

## Links

- Idea: `~/planner/ideas/validated/graymode-focus-extension.md`
- Code: `~/projects/browser-ext/graymode/`
