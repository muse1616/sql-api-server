// jwt模块
const jwt = require('jsonwebtoken')

// 密钥
const SECRET = 'musehujiajun'

function createToken(user) {
    let id = user.id;
    // 使用id生成token
    let token = jwt.sign({
        id
    }, SECRET, {
        // 过期时间7天
        'expiresIn': 60 * 60 * 24 * 7
    })
    return token
}

// 验证token
function verifyToken(header) {
    let promise = new Promise((resolve, reject) => {
        let token = header['authorization']
        if (!token) {
            reject(false)
        }
        jwt.verify(token, SECRET, (error, result) => {
            if (error) {
                reject(false)
            } else {
                resolve(true)
            }
        })
    })
    return promise
}

//导出模块
module.exports = {
    createToken,
    verifyToken
}