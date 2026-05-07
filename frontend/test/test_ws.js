const io = require("socket.io-client");
const axios = require("axios");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BASE_URL = "https://localhost";
const CHAT_ID = 1;
const USER1 = { email: "dima@goida.ru", password: "12345678" };
const USER2 = { email: "ian@goida.ru", password: "12345678" };
const DUMMY_CONNECTIONS_COUNT = 48;

async function login(user) {
    try {
        const res = await axios.post(`${BASE_URL}/api/auth/login`, user);
        return res.data.access_token;
    } catch (err) {
        console.error(`Ошибка авторизации ${user.email}:`, err.response?.data || err.message);
        process.exit(1);
    }
}

async function runTest() {
    console.log("1. Авторизация пользователей...");
    const token1 = await login(USER1);
    const token2 = await login(USER2);
    console.log("Токены получены!");

    console.log("2. Подключение Отправителя (A) и Получателя (B)...");
    
    const socketA = io(BASE_URL, { 
        path: "/api/chat/socket.io", 
        query: { token: token1 },
        transports: ["polling", "websocket"],
        rejectUnauthorized: false,
        forceNew: true
    });

    const socketB = io(BASE_URL, { 
        path: "/api/chat/socket.io", 
        query: { token: token2 },
        transports: ["polling", "websocket"],
        rejectUnauthorized: false,
        forceNew: true
    });

    socketA.on("connect", () => console.log("Отправитель (A) подключен к WS"));
    socketB.on("connect", () => console.log("Получатель (B) подключен к WS"));
    
    socketA.on("connect_error", (err) => console.error("Ошибка соединения A:", err.message));
    socketB.on("connect_error", (err) => console.error("Ошибка соединения B:", err.message));

    await new Promise((resolve) => {
        let connected = 0;
        const check = () => { if(++connected === 2) resolve(); };
        socketA.once("connect", check);
        socketB.once("connect", check);
    });

    console.log("3. Вход в комнату чата...");
    socketA.emit("join_chat", { chat_id: CHAT_ID });
    socketB.emit("join_chat", { chat_id: CHAT_ID });

    console.log("4. Создание фоновой нагрузки...");
    for (let i = 0; i < DUMMY_CONNECTIONS_COUNT; i++) {
        io(BASE_URL, { path: "/api/chat/socket.io", query: { token: token1 }, transports: ["websocket"] });
    }
    console.log(`Массовка (${DUMMY_CONNECTIONS_COUNT}) в очереди на подключение`);

    await new Promise(r => setTimeout(r, 2000));

    console.log("5. Замер времени доставки...");
    let t1;
    
    socketB.on("new_message", (msg) => {
        console.log("Поступило сообщение в сокет B:", msg.content);
        if (msg.content === "TEST_METRIC_MESSAGE") {
            const t2 = Date.now();
            const deltaT = t2 - t1;
            console.log(`\nМетрики получены.`);
            console.log(`Метка T1: ${t1} мс | Метка T2: ${t2} мс`);
            console.log(`Время доставки: ${deltaT} мс`);
            process.exit(0);
        }
    });

    t1 = Date.now();
    socketA.emit("send_message", { 
        chat_id: CHAT_ID, 
        content: "TEST_METRIC_MESSAGE" 
    });

    setTimeout(() => {
        console.log("ТАЙМ-АУТ: Сообщение не дошло. Проверьте логи chat_service.");
        process.exit(1);
    }, 6000);
}

runTest().catch(err => console.error("Критическая ошибка:", err));