// 初始化地圖
var map = L.map('map').setView([23.5, 121], 8);
console.log('地圖初始化成功'); // 調試代碼
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  errorTileUrl: 'no-image-icon-23494.png' // 可選：設置錯誤時的替代圖像
}).addTo(map).on('tileerror', function(error) {
  console.error('地圖圖層加載失敗', error); // 調試代碼
});
console.log('圖層添加成功'); // 調試代碼

// 測試地圖圖層加載
fetch('https://a.tile.openstreetmap.org/0/0/0.png')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.blob();
  })
  .then(blob => {
    console.log('地圖圖層加載成功');
  })
  .catch(error => {
    console.error('地圖圖層加載失敗', error);
  });

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
var poiMarkers = {};
var selectedMarker = null; // 用於保存所選位置的標記

// 動態生成下拉選單選項
var select = document.getElementById('poiTypeSelect');
var latInput = document.getElementById('latInput');
var lngInput = document.getElementById('lngInput');
var searchButton = document.getElementById('searchButton');
var uploadButton = document.getElementById('uploadButton');
var clearButton = document.getElementById('clearButton');
var fileInput = document.getElementById('fileInput');
var confirmationModal = $('#confirmationModal');
var confirmationMessage = document.getElementById('confirmationMessage');
var confirmButton = document.getElementById('confirmButton');

// 監聽POI類型選擇改變事件
select.addEventListener('change', function(e) {
  var selectedType = e.target.value;
  // 使用者選擇POI類型後，自動取得當前地圖中心點的經緯度進行查詢
  var center = map.getCenter();
  searchNearestPOIs(center.lat, center.lng, selectedType);
});

searchButton.addEventListener('click', function() {
  var lat = parseFloat(latInput.value);
  var lng = parseFloat(lngInput.value);
  var poiType = select.value;

  if (!isNaN(lat) && !isNaN(lng)) {
    setMarker(lat, lng);
    searchNearestPOIs(lat, lng, poiType);
  } else {
    alert('請輸入有效的經緯度');
  }
});

// 上傳POI數據
uploadButton.addEventListener('click', function() {
  fileInput.click();
});

fileInput.addEventListener('change', function() {
  var file = fileInput.files[0];
  if (file) {
    confirmationMessage.textContent = '確定要上傳這個POI數據文件嗎？';
    confirmButton.onclick = function() {
      var formData = new FormData();
      formData.append("file", file);

      fetch('https://chienweichang-poi-data.hf.space/upload-poi', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        confirmationModal.modal('hide');
      })
      .catch(error => {
        console.error('Error uploading POI data:', error);
        confirmationModal.modal('hide');
        alert('上傳POI數據失敗');
      });
    };
    confirmationModal.modal('show');
  }
});

// 清除POI
clearButton.addEventListener('click', function() {
  confirmationMessage.textContent = '確定要清除所有POI數據嗎？';
  confirmButton.onclick = function() {
    fetch('https://chienweichang-poi-data.hf.space/clear-kdtrees', {
      method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
      confirmationModal.modal('hide');
    })
    .catch(error => {
      console.error('Error clearing POI:', error);
      confirmationModal.modal('hide');
      alert('清除POI失敗');
    });
  };
  confirmationModal.modal('show');
});

// 查詢最近的POI
function searchNearestPOIs(lat, lng, poiType) {
  // 清空現有標記
  markersLayer.clearLayers();
  poiMarkers = {};

  // 調用後端API獲取最近的POI
  fetch(`https://chienweichang-poi-data.hf.space/poi/nearest?lat=${lat}&lng=${lng}&poi_type=${poiType}`)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        let infoHtml = generatePOITable(data);
        document.getElementById('info').innerHTML = infoHtml;

        // 更新地圖圖例
        updateLegend(new Set(data.map(poi => poi.poi_type)));

        // 為每個表格行添加點擊事件
        data.forEach((poi, index) => {
          document.getElementById(`poi-${index}`).addEventListener('click', () => {
            var marker = poiMarkers[index];
            map.setView(marker.getLatLng(), 15);  // 跳轉到POI位置並放大地圖
            marker.openPopup();  // 開啟POI的彈出訊息

            // 取消之前選中的標記樣式
            Object.values(poiMarkers).forEach(m => m.getElement().classList.remove('highlight'));
            // 添加選中標記的樣式
            marker.getElement().classList.add('highlight');
          });
        });
      } else {
        document.getElementById('info').innerHTML = `沒有找到附近的 POI`;
      }
    })
    .catch(error => {
      console.error('Error fetching nearest POI:', error);
      document.getElementById('info').innerHTML = `錯誤：無法獲取最近的POI`;
    });
}

function generatePOITable(data) {
  let infoHtml = `<table class="table table-bordered">
                    <thead>
                      <tr>
                        <th scope="col">名稱</th>
                        <th scope="col">類型</th>
                        <th scope="col">距離 (米)</th>
                      </tr>
                    </thead>
                    <tbody>`;

  data.forEach((poi, index) => {
    var customIcon = L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color: ${poiTypeColors[poi.poi_type] || 'gray'}; width: 12px; height: 12px;"></div>`
    });

    var marker = L.marker([poi.latitude, poi.longitude], { icon: customIcon })
      .bindPopup(`<b>${poi.name}</b><br>距離：${poi.distance} 米`)
      .bindTooltip(`<b>${poi.name}</b><br>距離：${poi.distance} 米`, { permanent: false, direction: 'top' })
      .addTo(markersLayer);

    // 保存marker以便後續使用
    poiMarkers[index] = marker;

    infoHtml += `<tr id="poi-${index}" class="poi-row">
                   <td>${poi.name}</td>
                   <td>${poi.poi_type}</td>
                   <td>${poi.distance}</td>
                 </tr>`;
  });

  infoHtml += `</tbody></table>`;
  return infoHtml;
}

// 點擊地圖事件
map.on('click', function(e) {
  var lat = e.latlng.lat;
  var lng = e.latlng.lng;
  var poiType = select.value;

  latInput.value = lat.toFixed(6);
  lngInput.value = lng.toFixed(6);

  setMarker(lat, lng);
  searchNearestPOIs(lat, lng, poiType);
});

// 在地圖上設置或更新標記
function setMarker(lat, lng) {
  if (selectedMarker) {
    map.removeLayer(selectedMarker);
  }
  selectedMarker = L.marker([lat, lng], { 
    icon: L.icon({ 
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', 
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', 
      iconAnchor: [12, 41], // 設置圖標的錨點為圖標底部中心
      shadowAnchor: [13, 41], // 設置陰影的錨點為陰影底部中心
      popupAnchor: [0, -41] // 設置彈出框的錨點為圖標頂部
    }) 
  }).addTo(map);
  map.setView([lat, lng], 15);  // 跳轉到所選位置並放大地圖
}

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
