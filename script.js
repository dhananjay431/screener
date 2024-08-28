var table = null;
document
.getElementById('exampleFormControlTextarea1')
.addEventListener('change', function (ev) {

     var data = JSON.parse(ev.target.value);
    const f = R.filter(d1 => d1.priority == 0);
    const g =  R.groupBy(d1 => d1.meta.industry)
  //   const r = R.reduce( (a,b)=>{ a.push( R.sort((a1,b1) => a1.ffmc < b1.ffmc )(b)); return a; },[])
    var z=  R.flow(data.data,[f]);
 data.data = z;

 if(table != null){
    table.destroy();
 }
 table = new DataTable('#example', {
    processing: true,
    serverSide: true,
    ajax: (dataTablesParameters, callback) => {
      console.log(dataTablesParameters);
      //data.data = R.sort((a,b)=>{ a[dataTablesParameters.order[0].name] >b[dataTablesParameters.order[0].name] })(data.data);
      //data.data = R.sort(R.ascend(R.prop('ffmc')),a.data)descend

      if(dataTablesParameters.order.length > 0 && dataTablesParameters.order[0].dir == 'asc'){
        data.data = R.sort(R.ascend(R.path(dataTablesParameters.order[0].name.split("."))),data.data)
      }else if(dataTablesParameters.order.length > 0 && dataTablesParameters.order[0].dir == 'desc'){
        data.data = R.sort(R.descend(R.path(dataTablesParameters.order[0].name.split("."))),data.data)
      }
      callback({
        recordsTotal: data.data.length,
        recordsFiltered: data.data.length,
        data: dataTablesParameters.length == -1 ? R.filter((d => d.priority == 0))(R.clone(data.data)) : R.filter((d => d.priority == 0))(R.clone(data.data)).splice(dataTablesParameters.start, dataTablesParameters.length)
      });
    },
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, 'All'],
    ],
    columns: [
      // { title: 'priority', data: 'priority' },
      {
        name: 'symbol', title: 'Symbol', data: 'symbol', render: (data, type, row) => {
          return `<a href='https://www.tradingview.com/chart/ceDp98UV/?symbol=NSE:${data}' target="_blank">${data}</a>`
        }
      },

      {
        title: 'Industry', name: 'meta.industry', render: (data, type, row) =>
          row.meta.industry,
      },
      // { title: 'identifier', data: 'identifier' },
      // { title: 'open', data: 'open' },
      // { title: 'dayHigh', data: 'dayHigh' },
      // { title: 'dayLow', data: 'dayLow' },
      { name: 'lastPrice', title: 'LastPrice', data: 'lastPrice' },
      { name: 'previousClose', title: 'PreviousClose', data: 'previousClose' },
      { name: 'change', title: 'Change', data: 'change' },
      { name: 'pChange', title: 'Change%', data: 'pChange' },
      {
        name: "ffmc",
        title: 'FFMC',
        data: 'ffmc',
        render: (data, type, row) =>
          Number((data / 1000000000).toFixed(2)),
      },
      { name: "yearHigh", title: 'YearHigh', data: 'yearHigh' },
      { name: "YearLow", title: 'YearLow', data: 'yearLow' },
      {
        name: "totalTradedVolume",
        title: 'TTVE',
        data: 'totalTradedVolume',
        render: (data, type, row) =>
          Number((data / 1000000).toFixed(2)),
      },
      {
        name: "totalTradedValue",
        title: 'TTV',
        data: 'totalTradedValue',
        render: (data, type, row) =>
          Number((data / 1000000).toFixed(2)),
      },
      // { title: 'lastUpdateTime', data: 'lastUpdateTime' },
      {
        name: "nearWKH",
        title: 'WKH',
        data: 'nearWKH',
        render: (data, type, row) => Number(data.toFixed(2)),
      },
      {
        name: "nearWKL",
        title: 'WKL',
        data: 'nearWKL',
        render: (data, type, row) => Number(data.toFixed(2)),
      },
      { name: "perChange365d", title: '365d%', data: 'perChange365d' },
      // { title: 'date365dAgo', data: 'date365dAgo' },
      // { title: 'date30dAgo', data: 'date30dAgo' },
      { name: "perChange30d", title: '30d%', data: 'perChange30d' },
    ],
    data: data.data
  });
});