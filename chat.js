export async function sendChatMessage(messages) {
try {
const response = await fetch("[http://localhost:3000/chat](http://localhost:3000/chat)", {
method: "POST",
headers: {"Content-Type": "application/json"},
body: JSON.stringify({ messages })
});

```
const data = await response.json();
return data.reply || "";
```

} catch (err) {
console.error("聊天请求失败:", err);
return "⚠ 서버 호출 실패 / 通信失败";
}
}
