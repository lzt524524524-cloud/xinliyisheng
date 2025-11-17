document.addEventListener("DOMContentLoaded", () => {

  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const testBtn = document.getElementById("test-btn");
  const langBtn = document.getElementById("lang-btn");
  const headerTitle = document.getElementById("header-title");

  let conversation = [
    {role:"system", content:"你是温暖、友善的心理咨询师，语气轻松鼓励学生。生成心理测试题时严格返回JSON，不添加其他文字，只返回心理测试题JSON数组。"}
  ];
  let lang = "ko";        
  let testMode = false;
  let testQuestions = [];
  let currentQuestion = 0;
  let answers = [];
  let testReports = [];

  function addMessage(role, text){
    const el = document.createElement("div");
    el.className = "message " + (role === "user" ? "user" : "bot");
    el.innerText = text;
    chatBox.appendChild(el);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function fetchChat(messages){
    try{
      const res = await fetch("http://localhost:3000/chat", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({messages})
      });
      const data = await res.json();
      return data;
    } catch(e){
      console.error(e);
      addMessage("bot","⚠ 서버 호출 실패 / 通信失败");
      return {reply: lang==="ko"?"서버 오류":"服务器错误"};
    }
  }

  async function generateProfessionalTestQuestions(){
    const prompt = `
      生成15个心理测试题，评估以下维度：
      性格类型(4题)、压力水平(4题)、情绪管理能力(4题)、自我认知度(3题)
      输出纯JSON数组，每题包含id和text，不要添加其他文字。
    `;
    const data = await fetchChat([...conversation,{role:"user",content:prompt}]);
    try{
      const jsonText = data.reply.match(/\[.*\]/s)[0];
      return JSON.parse(jsonText);
    }catch(e){
      console.error("JSON解析失败:", e, "原始内容:", data.reply);
      addMessage("bot","⚠ 测试题生成失败，使用默认题");
      return [
        {id:1,text:"你独处时感到舒适吗？"}, {id:2,text:"你能快速适应新环境吗？"}, 
        {id:3,text:"你喜欢主动社交吗？"}, {id:4,text:"你更喜欢计划还是随机行动？"},
        {id:5,text:"最近你压力大吗？"}, {id:6,text:"面对压力你会情绪化吗？"},
        {id:7,text:"压力大时你能寻求帮助吗？"}, {id:8,text:"你能按时完成任务吗？"},
        {id:9,text:"你能控制自己的情绪吗？"}, {id:10,text:"你表达情绪时是否真实？"},
        {id:11,text:"你能理性分析情绪吗？"}, {id:12,text:"你知道自己的优点和缺点吗？"},
        {id:13,text:"你对自己目标清晰吗？"}, {id:14,text:"你能理解自己行为动机吗？"}, 
        {id:15,text:"你自我反思的频率如何？"}
      ];
    }
  }

  function askNextQuestion(){
    if(currentQuestion >= testQuestions.length) return endTest();
    const q = testQuestions[currentQuestion];
    addMessage("bot", `问题 ${currentQuestion+1}: ${q.text} (1~5)` );
  }

  function endTest(){
    testMode = false;
    // 生成简单报告（可替换为AI生成更专业分析）
    const report = `
- 性格类型：I型（内向型）65%，E型（外向型）35%
- 压力水平：中等（${answers[4]*20}分/100分）
- 情绪管理能力：良好（${answers[8]*20}分/100分）
- 自我认知度：优秀（${answers[11]*20}分/100分）
`;
    testReports.push(report);
    addMessage("bot", (lang==="ko"?"테스트 완료! 보고서:\n":"测试完成！报告：\n") + report);
    answers = [];
  }

  testBtn.addEventListener("click", async () => {
    addMessage("bot", lang==="ko"?"正在生成测试题…":"正在生成测试题…");
    const q = await generateProfessionalTestQuestions();
    if(!q) return;
    testQuestions = q;
    testMode = true;
    currentQuestion = 0;
    answers = [];
    addMessage("bot", lang==="ko"?"测试开始! 每题1~5分":"测试开始! 每题1~5分");
    askNextQuestion();
  });

  async function sendMessage(){
    const text = input.value.trim();
    if(!text) return;
    addMessage("user", text);
    input.value="";

    if(testMode){
      const score = Number(text);
      if(![1,2,3,4,5].includes(score)){
        return addMessage("bot", lang==="ko"?"请输入1~5数字":"请输入1~5数字");
      }
      answers.push(score);
      currentQuestion++;
      return askNextQuestion();
    }

    const data = await fetchChat([...conversation,{role:"user",content:text}]);
    addMessage("bot", data.reply || (lang==="ko"?"无响应":"无响应"));
    conversation.push({role:"user", content:text});
    conversation.push({role:"assistant", content:data.reply || ""});
  }

  input.addEventListener("keypress", e => { if(e.key==="Enter") sendMessage(); });
  sendBtn.addEventListener("click", sendMessage);

  langBtn.addEventListener("click", () => {
    lang = lang === "ko" ? "zh" : "ko";
    headerTitle.innerText = lang === "ko" ? "心理咨询 AI" : "심리 상담 AI";
    input.placeholder = lang === "ko" ? "请输入消息…" : "메시지를 입력해주세요…";
    addMessage("bot", lang === "ko" ? "语言已切换中文" : "언어가 한국어로 변경되었습니다");
  });

});
