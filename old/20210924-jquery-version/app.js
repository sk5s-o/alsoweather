let CWB_KEY = "CWB-1485B01A-7416-4E72-8ABB-E351980FD554";
let CWB_API = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${CWB_KEY}&format=JSON`;
let QUICK_CHART_API = `https://quickchart.io/chart?bkg=white&c=`

let cwb_location_select = document.getElementById("cwb_location_select")
let maxt_chart_image = document.getElementById("maxt_chart_image")
let maxt_chart_element
let mint_chart_image = document.getElementById("mint_chart_image")
let mint_chart_element

cwb_location_select.addEventListener("input", locationInputService)

fetchcwb(CWB_API)

async function fetchcwb(url) {
  let responseData;
  try {
    await fetch(url,{
      method : "GET"
    }).then((response) => {
      return response.json();
    }).then(response => {
      responseData = response
    })
  } catch (error) {
    alert(error.message)
  }
  try {
    let locationNameIndex;
    restorelocation()
    cwb_location_select = document.getElementById("cwb_location_select")
    for (let i = 0; i < responseData.records.location.length; i++) {
      let locationName = await responseData.records.location[i].locationName
      if (cwb_location_select.value == locationName){
        locationNameIndex = i
      }
    }
    console.log("location index: ",locationNameIndex)
    let weatherElement = await responseData.records.location[locationNameIndex].weatherElement
    console.log(weatherElement)
    let maxt_chart_image_data = {
      type: "line",
      data: {}
    }
    let mint_chart_image_data = {
      type: "line",
      data: {}
    }
    for (let i = 0; i < weatherElement.length; i++) {
      let weatherElementName = await weatherElement[i].elementName
      // 如果是最大溫度
      if (weatherElementName == "MaxT"){
        let data = []
        for (let z = 0; z < weatherElement[i].time.length; z++) {
          const element = weatherElement[i].time[z];
          
          data.push(time(element.startTime))
          if (maxt_chart_image_data.data.labels == undefined) maxt_chart_image_data.data.labels = []
          // maxt_chart_image_data.data.labels.push(element.startTime)
          // 如果是最後一個Time
          if (z == weatherElement[i].time.length-1){
            data.push(time(element.endTime))
          }
        }
        // 產生標籤
        for (let y = 0; y < data.length-1; y++) {
          let text = data[y]+" - "+data[y+1]
          console.log(text)
          maxt_chart_image_data.data.labels.push(text)
        }
        for (let z = 0; z < weatherElement[i].time.length; z++) {
          const element = weatherElement[i].time[z];
          if (maxt_chart_image_data.data.datasets == undefined) maxt_chart_image_data.data.datasets = [{
            label: "最大溫度",
            data: []
          }]
          maxt_chart_image_data.data.datasets[0].data.push(element.parameter.parameterName)
        }
        console.log(JSON.stringify(maxt_chart_image_data))
        // maxt_chart_image.src = QUICK_CHART_API + JSON.stringify(maxt_chart_image_data)
        if (maxt_chart_element != undefined) maxt_chart_element.destroy();
        maxt_chart_element = chart(maxt_chart_image, maxt_chart_image_data)
      }
      // 如果是最小溫度
      if (weatherElementName == "MinT"){
        let data = []
        for (let z = 0; z < weatherElement[i].time.length; z++) {
          const element = weatherElement[i].time[z];
          
          data.push(time(element.startTime))
          if (mint_chart_image_data.data.labels == undefined) mint_chart_image_data.data.labels = []
          // 如果是最後一個Time
          if (z == weatherElement[i].time.length-1){
            data.push(time(element.endTime))
          }
        }
        // 產生標籤
        for (let y = 0; y < data.length-1; y++) {
          let text = data[y]+" - "+data[y+1]
          console.log(text)
          mint_chart_image_data.data.labels.push(text)
        }
        for (let z = 0; z < weatherElement[i].time.length; z++) {
          const element = weatherElement[i].time[z];
          if (mint_chart_image_data.data.datasets == undefined) mint_chart_image_data.data.datasets = [{
            label: "最小溫度",
            data: []
          }]
          mint_chart_image_data.data.datasets[0].data.push(element.parameter.parameterName)
        }
        console.log(JSON.stringify(mint_chart_image_data))
        if (mint_chart_element != undefined) mint_chart_element.destroy();
        mint_chart_element = chart(mint_chart_image, mint_chart_image_data)
      }
    }
  } catch (error) {
    alert(error.message)
  }
}


function chart(element,params){
  let ctx = element
  canvas = new Chart(ctx, params);
  return canvas
}

function time(str){
  let m = new Date(str)
  let dateString = `${m.getUTCMonth()+1}/${m.getUTCDate()} ${m.getUTCHours()}點`;
  return dateString
}

function locationInputService(){
  fetchcwb(CWB_API);
  console.log(cwb_location_select.value)
  localStorage.setItem("locationSelected",cwb_location_select.value)
}
function restorelocation(){
  cwb_location_select = document.getElementById("cwb_location_select")
  let data = localStorage.getItem("locationSelected")
  if (data){
    cwb_location_select.value = data
  } else {
    cwb_location_select.value = "新竹市"
  }
  $( "#cwb_location_select" ).selectmenu( "refresh" );
}