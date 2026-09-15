# Vercel + Telegram sozlash

1. Telegram’da `@BotFather`ni oching: `/mybots` → botingizni tanlang → `API Token` → `Revoke current token`. Yangi tokenni hech qayerga chatga yoki GitHub’ga yubormang.
2. Loyihani Vercel’ga ulang va **Settings → Environment Variables** bo‘limida `.env.example`dagi barcha qiymatlarni kiriting. Token faqat `TELEGRAM_BOT_TOKEN` qiymatida bo‘ladi.
3. Deploy bo‘lgach, Vercel domeningizni yozib oling, masalan `https://portfolio.example.vercel.app`.
4. Telegram webhook’ini brauzer yoki terminal orqali o‘rnating. Quyidagi joylardagi qiymatlarni o‘zingizning yangi tokeningiz va maxfiy satringiz bilan almashtiring:

   `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<VERCEL-DOMAIN>/api/telegram-webhook&secret_token=<WEBHOOK-SECRET>`

5. Audit guruhida botga `/chatid` yuboring. Bot qaytargan to‘liq (odatda manfiy) sonni `TELEGRAM_AUDIT_CHAT_ID` sifatida kiriting va yana deploy qiling.
6. Botning shaxsiy chatida `/start`, Telegram/Gmail modalidan botga o‘tish va `/donate`ni tekshiring. Saytdagi forma yuborilganda faqat egaga ism, familiya, email va xabar boradi; audit guruhida esa foydalanuvchi roziligi bilan berilgan forma ma’lumotlari yoziladi.

Webhook va `getUpdates` bir vaqtda ishlamaydi; production uchun webhookdan foydalaning.
