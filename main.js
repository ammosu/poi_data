// 初始化地圖
var map = L.map('map').setView([23.5, 121], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

// 定義顏色對應的poi_type
var poiTypeColors = {
  "mrt": "red",
  "school": "blue",
  "landfill": "green",
  "hospital": "yellow",
  "collage": "purple",
  "park": "orange",
  "financial_industry": "cyan",
  "entertainment": "magenta",
  "shopping": "lime",
  "temple": "brown",
  "funeral_industry": "navy",
  "night_market": "olive",
  "hsr": "teal",
  "gas_station": "pink",
  "station": "coral",
  "bus_station": "gold"
};

// 創建標記圖層
var markersLayer = L.layerGroup().addTo(map);

// 動態生成下拉選單選項
var select = document.getElementById('poiTypeSelect');
var latInput = document.getElementById('latInput');
var lngInput = document.getElementById('lngInput');
var searchButton = document.getElementById('searchButton');

select.addEventListener('change', function(e) {
  var selectedType = e.target.value;
});

searchButton.addEventListener('click', function() {
  var lat = parseFloat(latInput.value);
  var lng = parseFloat(lngInput.value);
  var poiType = select.value;

  if (!isNaN(lat) && !isNaN(lng)) {
    searchNearestPOIs(lat, lng, poiType);
  } else {
    alert('請輸入有效的經緯度');
  }
});

// 查詢最近的POI
function searchNearestPOIs(lat, lng, poiType) {
  // 清空現有標記
  markersLayer.clearLayers();

  // 調用後端API獲取最近的POI
  fetch(`http://localhost:3000/poi/nearest?lat=${lat}&lng=${lng}&poi_type=${poiType}`)
    .then(response => response.json())
    .then(data => {
      let infoHtml = `點擊座標：緯度 ${lat.toFixed(8)}，經度 ${lng.toFixed(8)}<br>最近的前10個POI：<ul>`;
      let displayedTypes = new Set();
      data.forEach(poi => {
        var marker = L.circleMarker([poi.latitude, poi.longitude], {
          color: poiTypeColors[poi.poi_type] || 'gray',
          radius: 8
        }).bindPopup(`<b>${poi.name}</b><br>距離：${poi.distance} 米`);
        markersLayer.addLayer(marker);

        infoHtml += `<li>${poi.name}（${poi.poi_type}），距離：${poi.distance} 米</li>`;
        displayedTypes.add(poi.poi_type);
      });
      infoHtml += `</ul>`;
      document.getElementById('info').innerHTML = infoHtml;

      // 更新地圖圖例
      updateLegend(displayedTypes);
    })
    .catch(error => {
      console.error('Error fetching nearest POI:', error);
      document.getElementById('info').innerHTML += `<br>錯誤：無法獲取最近的POI`;
    });
}

// 點擊地圖事件
map.on('click', function(e) {
  var lat = e.latlng.lat;
  var lng = e.latlng.lng;
  var poiType = select.value;

  latInput.value = lat.toFixed(8);
  lngInput.value = lng.toFixed(8);

  searchNearestPOIs(lat, lng, poiType);
});

// 更新地圖圖例
function updateLegend(displayedTypes) {
  var legendHtml = '<b>圖例</b><br>';
  displayedTypes.forEach(type => {
    legendHtml += `<i style="background:${poiTypeColors[type]}; width: 12px; height: 12px; display: inline-block; margin-right: 5px;"></i> ${type}<br>`;
  });
  document.getElementById('legend').innerHTML = legendHtml;
}

// 初始加載圖例
updateLegend(new Set());
