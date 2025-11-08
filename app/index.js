// main.js
import { Client, GatewayIntentBits, Partials } from "discord.js";
import fetch from "node-fetch";
import express from "express";

// ---------------------
// 1. Discord Bot 設定
// ---------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const TOKEN = "MTQzNjMxNjI3NDMxNjU0NjEyMA.G9MhpV.HJKyIPUZSUG1_ufxsouJB56ay7FFyZR3U8Tv1w";
const UPDATE_URL = "https://arato3663.stars.ne.jp/UA/update_user.php";

// ワンタイムパス生成
function generatePassword2() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// DM の認証処理
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (message.channel.type !== 1) return; // DM のみ

  const parts = message.content.split(" ");
  if (parts[0] !== "認証") return;

  const password1 = parts[1];
  if (!password1) return message.reply("❌ パスワード1を入力してください。");

  // ユーザー情報取得
  const res = await fetch("https://arato3663.stars.ne.jp/UA/users.json");
  const data = await res.json();

  let foundId = null;
  for (const [id, info] of Object.entries(data)) {
    if (info.password1 === password1) {
      foundId = id;
      break;
    }
  }

  if (!foundId) return message.reply("❌ パスワード1が一致しません。");

  const password2 = generatePassword2();

  // サーバーに書き込み
  await fetch(UPDATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64id: foundId, password2 })
  });

  message.reply(`✅ ワンタイムパスワード: **${password2}** （有効期限あり）`);
});

client.once("ready", () => {
  console.log(`✅ Bot起動完了: ${client.user.tag}`);
});

client.login(TOKEN);

// ---------------------
// 2. Express サーバー (自己 Ping 用)
// ---------------------
const app = express();

// Bot 状態確認用
app.get("/", (req, res) => res.send("Bot is alive!"));

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Express server running on port ${PORT}`));

// ---------------------
// 3. 自己 Ping でスリープ防止
// ---------------------
const SELF_URL = "https://e9069b31-81f7-4ed2-a00f-144419d49cac-00-3d85hqjns6q2y.pike.replit.dev";

setInterval(() => {
  fetch(SELF_URL)
    .then(() => console.log("Ping sent to keep awake"))
    .catch(console.error);
}, 5 * 60 * 1000); // 5分ごと
