var table = null;
var data;
var dynamicConditionArr = [];
document.getElementById("index").addEventListener("change", function (ev) {

  let url = `https://www.nseindia.com/api/equity-stockIndices?index=${ev.target.value}`
  window.open(url, '_blank');
})
document
  .getElementById('exampleFormControlTextarea1')
  .addEventListener('change', function (ev) {

    data = JSON.parse(ev.target.value);
    const f = R.filter(d1 => d1.priority == 0);
    const g = R.groupBy(d1 => d1.meta.industry)
    //   const r = R.reduce( (a,b)=>{ a.push( R.sort((a1,b1) => a1.ffmc < b1.ffmc )(b)); return a; },[])
    var z = R.flow(data.data, [f]);
    data.data = z;

    if (table != null) {
      table.destroy();
    }
    table = new DataTable('#example', {
      processing: true,
      serverSide: true,
      ajax: (dataTablesParameters, callback) => {
        console.log(dataTablesParameters);
        //data.data = R.sort((a,b)=>{ a[dataTablesParameters.order[0].name] >b[dataTablesParameters.order[0].name] })(data.data);
        //data.data = R.sort(R.ascend(R.prop('ffmc')),a.data)descend

        if (dataTablesParameters.order.length > 0 && dataTablesParameters.order[0].dir == 'asc') {
          data.data = R.sort(R.ascend(R.path(dataTablesParameters.order[0].name.split("."))), data.data)
        } else if (dataTablesParameters.order.length > 0 && dataTablesParameters.order[0].dir == 'desc') {
          data.data = R.sort(R.descend(R.path(dataTablesParameters.order[0].name.split("."))), data.data)
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
        { name: "yearLow", title: 'YearLow', data: 'yearLow' },
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
        { name: "perChange30d", title: '30d%', data: 'perChange30d' },
      ],
      data: data.data
    });
  });

/* 
    <option value="gt">  > </option>
          <option value="gte"> >= </option>
          <option value="lt"> < </option>
          <option value="lte"> <= </option>
          <option value="eq"> = </option>
           */
document.getElementById("add").addEventListener('click', function () {
  let prop = document.getElementById("get1").value;
  let condi = document.getElementById("get2").value;
  let value = document.getElementById("get3").value;
  if (condi == "gt") {
    dynamicConditionArr.push(R.filter((d) => d[prop] > Number(value)))
  }
  if (condi == "gte") {
    dynamicConditionArr.push(R.filter((d) => d[prop] >= Number(value)))
  }
  if (condi == "lt") {
    dynamicConditionArr.push(R.filter((d) => d[prop] < Number(value)))
  }
  if (condi == "lte") {
    dynamicConditionArr.push(R.filter((d) => d[prop] <= Number(value)))
  }
  if (condi == "eq") {
    dynamicConditionArr.push(R.filter((d) => d[prop] == Number(value)))
  }

  console.log(prop, " ", condi, " ", value)
  console.log(data.data);

})
document.getElementById("search").addEventListener('click', function () {

  data.data = R.pipe(...dynamicConditionArr)(data.data)
  table.draw();
})
document.getElementById("clear").addEventListener('click', function () {
  debugger;
  dynamicConditionArr= [];
  data = JSON.parse(document.getElementById("exampleFormControlTextarea1").value);
  const f = R.filter(d1 => d1.priority == 0);
  var z = R.flow(data.data, [f]);
  data.data = z;
  table.draw();
})
document.getElementById("download").addEventListener('click', function () {
  _download(data.data);
})


function _download(_jsonData){
  function downloadCSVFromJSON(jsonData, fileName = 'data.csv') {
    // Convert JSON array to CSV string
    const csvString = convertToCSV(jsonData);

    // Create a Blob from the CSV string
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Create a link element
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // Create a URL for the Blob and set it as the href attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);

      // Append the link to the document body
      document.body.appendChild(link);

      // Trigger a click on the link to download the file
      link.click();

      // Clean up by removing the link and revoking the Object URL
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  function convertToCSV(jsonData) {
    const array =
      typeof jsonData !== 'object' ? JSON.parse(jsonData) : jsonData;

    // Extract the headers
    const headers = Object.keys(array[0]).join(',');

    // Map each object to a CSV row
    const csvRows = array.map((obj) => {
      return Object.values(obj)
        .map((value) => {
          // Escape quotes by doubling them
          const escapedValue = String(value).replace(/"/g, '""');
          // Wrap values containing commas or quotes in double quotes
          return /[",\n]/.test(escapedValue)
            ? `"${escapedValue}"`
            : escapedValue;
        })
        .join(',');
    });

    // Combine the headers and rows into a single CSV string
    return [headers, ...csvRows].join('\n');
  }
  let x = _jsonData.map((rd) => {
    
    return [
"symbol",
"meta.industry",
"lastPrice",
"previousClose",
"change",
"pChange",
"ffmc",
"yearHigh",
"yearLow",
"totalTradedVolume",
"totalTradedValue",
"nearWKH",
"nearWKL",
"perChange365d",
"perChange30d",
    ].reduce((a, b) => {
      let dtx = R.path(b.split("."),rd);

      a[b] = dtx;
      return a;
    }, {});
  });
  downloadCSVFromJSON(x);
}

