# poi_data

這是一個顯示POI點的前端應用，可以根據poi_type選擇顯示特定類別的POI，並在地圖上標示出來。點擊地圖可以顯示當前座標，並查詢最近的前10個POI。

## 功能特性

- 顯示地圖並標示POI點
- 根據poi_type篩選POI
- 點擊地圖顯示當前座標並查詢最近的POI
- 圖例顯示不同poi_type的顏色對應

## 技術棧

- HTML
- CSS
- JavaScript
- [Leaflet](https://leafletjs.com/)
- [Bootstrap](https://getbootstrap.com/)

## 安裝與使用

### 前提條件

確保您已安裝以下軟體：

- [Node.js](https://nodejs.org/)

### 克隆倉庫

```bash
git clone https://github.com/ammosu/poi_data.git
cd poi_data
```

### 安裝依賴

```bash
npm install
```

### 運行應用

```bash
npm start
```

此命令將啟動開發伺服器，並在瀏覽器中打開應用。默認URL是http://localhost:8080。


## 使用說明

1. **選擇POI類型**：使用頁面上的下拉選單選擇您想要顯示的POI類型。
2. **輸入經緯度**：在輸入框中輸入經緯度，或者點擊地圖獲取經緯度。
3. **查詢最近POI**：點擊“查詢最近的前10個POI”按鈕，地圖上會標示最近的POI，並顯示在右側信息欄。

## 文件結構

poi_data
├── index.html
├── styles.css
├── main.js
└── README.md

## 常見問題
### 如何更改地圖的默認中心位置？
您可以在`main.js`文件中找到初始化地圖的位置，修改以下代碼中的緯度和經度：

```javascript
var map = L.map('map').setView([23.5, 121], 8);
```

### 如何新增或修改POI類型和顏色？
您可以在`main.js`文件中找到定義顏色對應model_type的位置，修改或新增以下代碼：

```javascript
var modelTypeColors = {
  "mrt": "red",
  "school": "blue",
  // 新增或修改顏色
};
```