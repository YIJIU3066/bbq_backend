# 使用官方 Node.js 映像
FROM node:14

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製專案文件
COPY . .

# 設置環境變量以使用 Cloud Run 提供的端口
ENV PORT=8080

# 暴露應用埠
EXPOSE 8080

# 啟動應用
CMD ["npm", "start"]
