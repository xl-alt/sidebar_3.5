const express = require("express");
const axios = require("axios");
var bodyParser = require("body-parser");

const { HttpsProxyAgent } = require('https-proxy-agent');

const { encode, decode } = require('gpt-3-encoder');


const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
// 创建一个Express应用实例
const app = express();
// 定义端口号
// app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
const PORT = 3000;
app.get("/", (req, res) => {
    res.send("欢迎来到Node.js Express应用！");
});

// 随机谷歌账户
// 传输一个 token 从 txt01 到 txt02
function isJsonString(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// var user = "RIH81793940631997830"
// var password = "yrJVNxUOFtrv"
// var host = "dyn.horocn.com"
// var port = 50000

// var proxyUrl = "http://" + user + ":" + password + "@" + host + ":" + port;
// var proxiedRequest = request.defaults({'proxy': proxyUrl});

// proxiedRequest.get("https://httpbin.org/ip", function (error, response, body) {
//     console.log('Your public IP via proxy:', response);
// })


function generateCustomString() {
    const prefix = '10010'; // 前缀固定为10010
    const lengthOfRandomPart = 9; // 随机部分的长度
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 可以从中选择的字符集
    let randomPart = '';

    // 生成随机部分的字符串
    for (let i = 0; i < lengthOfRandomPart; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomPart += characters[randomIndex];
    }

    // 将固定前缀与随机生成的字符串部分拼接
    return prefix + randomPart;
}
function generateRandomString() {
    const length = 21; // 目标字符串的长度
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}
function findDifference(str1, str2) {
    // 检查第一个字符串是否是第二个字符串的一部分
    if (str2.startsWith(str1)) {
        // 如果是，返回第二个字符串的不同部分
        return str2.slice(str1.length);
    } else {
        // 如果不是，返回一个提示信息或者处理其他逻辑
        return "";
    }
}


async function formatMessages(messages) {
    // 过滤掉 role 为 system 的消息
    const filteredMessages = messages.filter(
        (message) => message.role !== "system",
    );

    // 格式化剩余的消息
    const formattedMessages = filteredMessages.map(
        (message) => `${message.role}: ${message.content}`,
    );

    // 拼接所有消息
    return formattedMessages.join("\n");
}

function getLastSystemContent(data) {
    let lastSystemMessage = null;
    for (let message of data.messages) {
        if (message.role === "system") {
            lastSystemMessage = message.content;
        }
    }
    return lastSystemMessage; // Returns the last system message, or null if none found
}

// 开始处理数据
app.post("/v1/chat/completions", async (req, res) => {
    let databody = req.body
    let index = 0
    databody.messages.forEach(element => {
        if (element && element != "" && element != undefined && databody.model != "gpt-4-vision-preview") {
            index += encode(JSON.stringify(element.content)).length;
        }
    });
    let model = "GPT-3.5"
    if(databody.model == "claude-3-haiku-20240307"){
        model = "Claude 3 Haiku"
    }else if(databody.model == "claude-3-sonnet-20240229") {
        model = "Claude 3 Sonnet"
    }else if(databody.model == "claude-3-opus-20240229") {
        model = "Claude 3 Opus"
    }
    // 开始处理数据
    const transformedMessages = databody.messages.map(message => {
        if (message.role === "user") {
            const transformedMessage = {
                "extra_data": {
                    "prompt_mode": false
                },
                "item": message.content,
                "loading": false,
                "role": "user",
                "title": null
            }
            return transformedMessage;
        } else if (message.role === "assistant") {
            return {
                "extra_data": {
                    "prompt_mode": false
                },
                "item": message.content,
                "loading": false,
                "role": "assistant",
                "title": null
            }

        } else if (message.role === "system") {
            return {
                "extra_data": {
                    "prompt_mode": false
                },
                "item": message.content,
                "loading": false,
                "role": "system",
                "title": null
            }
        }
        else {
            // 对于不是user或assistant的角色，这里我们选择跳过它们
            return null;
        }
    }).filter(message => message !== null);
    // 开始刷新token
    const proxyUrl = 'http://lC81fjl9SvCKDtj:JqMKe49mbzHchxs@103.229.116.121:45377';
    // 创建HTTPS代理代理
    const proxyAgent = new HttpsProxyAgent(proxyUrl);
    await fishedMessage(proxyAgent,transformedMessages,model,res,databody,index)
});

async function fishedMessage(proxyAgent,transformedMessages,model,res,databody,index) {
    const options = {
        url: "https://extensions.aitopia.ai/ai/send",
        method: "POST",
        headers: {
            Connection: "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
        },
        data: {
            "history": transformedMessages,
            "model": model,
            "stream": true,
            "mode": "ai_chat",
            "prompt_mode": false,
            "extra_key": "__all",
            "extra_data": {
                "prompt_mode": false
            },
            "language_detail": {},
            "is_continue": false,
            "lang_code": "zh"
        },
        httpsAgent: proxyAgent,
        responseType: 'stream',
        timeout: 20000
    };
    let nonstr = ""
    let linshiData = ""
    let linshiData1 = ""
    axios(options)
        .then(response => {
            response.data.on('data', (chunk) => {
                let message = `${chunk.toString()}`
                linshiData += message
                message = linshiData.split(/data: /)
                let str1 = ""
                message.forEach(element => {
                    if (isJsonString(element) && JSON.parse(element).choices && JSON.parse(element).choices[0] && JSON.parse(element).choices[0].delta) {
                        str1 += JSON.parse(element).choices[0].delta.content
                    }
                });
                let strsend = findDifference(linshiData1, str1)
                linshiData1 = str1

                nonstr += strsend
                if (databody.stream == true) {
                    res.write(`data: {"id":"chatcmpl-9709rQdvMSIASrvcWGVsJMQouP2UV","object":"chat.completion.chunk","created":${Math.floor(Date.now() / 1000)},"model":"${databody.model}","system_fingerprint":"fp_3bc1b5746c","choices":[{"index":0,"delta":{"content":${JSON.stringify(strsend)}},"logprobs":null,"finish_reason":null}]} \n\n`)
                }
            });
            response.data.on('end', () => {
                if (!databody.stream || databody.stream != true) {
                    res.json({
                        id: "chatcmpl-8Tos2WZQfPdBaccpgMkasGxtQfJtq",
                        object: "chat.completion",
                        created: Math.floor(Date.now() / 1000),
                        model: databody.model,
                        choices: [
                            {
                                index: 0,
                                message: {
                                    role: "assistant",
                                    content: nonstr,
                                },
                                finish_reason: "stop",
                            },
                        ],
                        usage: {
                            prompt_tokens: index,
                            completion_tokens:  encode(nonstr).length,
                            total_tokens: index + encode(nonstr).length,
                        },
                        system_fingerprint: null,
                    });
                    return;
                }
                res.write(
                    `data: {"id":"chatcmpl-89CvUKf0C36wUexKrTrmhf5tTEnEw","object":"chat.completion.chunk","model":"${databody.model}","created":${Math.floor(
                        Date.now() / 1000,
                    )},"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n`,
                );
                res.write(`data: [DONE]\n`);
                res.end();
            });
        })
        .catch(error => {
            res.status(500).send("代理请求出错");
        });
}

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
