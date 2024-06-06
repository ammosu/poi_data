# 使用 Node.js 官方鏡像作為基礎鏡像
FROM node:14

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json（如果有）
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製應用程序文件
COPY . .

# 暴露應用運行的端口
EXPOSE 8080

# 運行應用程序
CMD ["npx", "http-server", "-p", "8080"]
