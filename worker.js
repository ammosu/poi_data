self.addEventListener('message', function(e) {
  var data = e.data;
  if (data.type === 'filter') {
    var filteredData = data.allData.filter(function(d) {
      return data.modelType === 'all' || d.model_type === data.modelType;
    });
    self.postMessage({type: 'filtered', data: filteredData});
  }
});
