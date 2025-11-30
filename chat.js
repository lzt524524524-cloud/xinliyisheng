import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// POST /chat 接口，接收消息并调用 OpenAI API
app.post("/chat", async (req, res) => {
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
return res.status(500).json({ error: "Missing API key" });
}

const { messages } = req.body;
if (!messages || !Array.isArray(messages)) {
return res.status(400).json({ error: "Invalid messages format" });
}

try {
const response = await fetch("[https://api.openai.com/v1/chat/completions](https://api.openai.com/v1/chat/completions)", {
method: "POST",
headers: {
"Authorization": `Bearer ${OPENAI_API_KEY}`,
"Content-Type": "application/json"
},
body: JSON.stringify({
model: "gpt-4o-mini",
messages
})
});

```
const data = await response.json();

const reply = data.choices?.[0]?.message?.content || "";
res.json({ reply });
```

} catch (err) {
console.error(err);
res.status(500).json({ error: "Server error" });
}
});

// 本地开发端口，可在 Vercel 部署时忽略
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

export default app;
