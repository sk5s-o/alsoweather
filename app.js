// declare keys

// api key
const CWB_KEY = "CWB-1485B01A-7416-4E72-8ABB-E351980FD554";
// api url
const CWB_API = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${CWB_KEY}&format=JSON`;
// api url
const QUOTE_API = `https://api.quotable.io/random`

// declare objects
const fetched_quote_data = {
  content: null,
  author: null
}
let fetched_cwb_data = {}
let parsed_cwb_data = {
  now: {}
}
window.model = {
  mylocation: ''
}

// grab html dom element
let cwb_location_select = document.getElementById("cwb_location_select")
let quote_block_inner_content = document.getElementById("quote_block_inner_content")
let loading_quote_skeleton = document.getElementById("loading_quote_skeleton")
let weather_block_inner_content = document.getElementById("weather_block_inner_content")
let loading_weather_skeleton = document.getElementById("loading_weather_skeleton")

// eventlistener
cwb_location_select.addEventListener("input",locationInputService)

// init
document.addEventListener("DOMContentLoaded", () => {
  restorelocation()
  fetchcwb(CWB_API)
  console.log(CWB_API)
  fetchquote(QUOTE_API)
  console.log(QUOTE_API)
})

// fetch cwb api
async function fetchcwb(url) {
  try {
    const response = await fetch(url,{
      method : "GET"
    })
    const jsonData = await response.json();
    console.log(jsonData.records.datasetDescription)
    fetched_cwb_data = await jsonData.records.location
    let location_index = find_location_index(fetched_cwb_data,cwb_location_select.value)
    console.log(fetched_cwb_data[location_index].weatherElement[0].time[0].parameter.parameterName)
    parsed_cwb_data.now.Wx = fetched_cwb_data[location_index].weatherElement[0].time[0].parameter.parameterName
    parsed_cwb_data.now.PoP = fetched_cwb_data[location_index].weatherElement[1].time[0].parameter.parameterName
    parsed_cwb_data.now.MinT = fetched_cwb_data[location_index].weatherElement[2].time[0].parameter.parameterName
    parsed_cwb_data.now.CI = fetched_cwb_data[location_index].weatherElement[3].time[0].parameter.parameterName
    parsed_cwb_data.now.MaxT = fetched_cwb_data[location_index].weatherElement[4].time[0].parameter.parameterName

    fillin_weather(generate_now_weather(parsed_cwb_data.now),weather_block_inner_content,loading_weather_skeleton)

  } catch (error) {
    alert(error.message)
  }
}

async function fetchquote(url) {
  try {
    const response = await fetch(url,{
      method : "GET"
    })
    const jsonData = await response.json();
    fetched_quote_data.content = await jsonData.content
    fetched_quote_data.author = await jsonData.author
    console.log("quote fetch complete")
    fillin_quote(fetched_quote_data, quote_block_inner_content, loading_quote_skeleton)
  } catch (error) {
    alert(error.message)
  }
}

// xdata
function xdata() {
  return model
}

// refresh
function refresh() {
  // set loading class
  loading_weather_skeleton.classList.add("invisible")
  cwb_location_select.parentElement.classList.add("is-loading")
  console.log("refresh now")
  fetchcwb(CWB_API)
}

// location input service
function locationInputService(){
  refresh()
  console.log(cwb_location_select.value)
  localStorage.setItem("locationSelected",cwb_location_select.value)
}

// fillin_quote
function fillin_quote(data_element, element_to_fill_in, element_to_remove) {
  element_to_fill_in.innerHTML = `<span class="is-large">${data_element.content}</span>`
  element_to_fill_in.innerHTML += `<br><span class="has-text-grey">- ${data_element.author}</span>`
  element_to_remove.remove()
}

// fillin_weather
function fillin_weather(element, element_to_be_fill_in, element_to_remove) {
  element_to_be_fill_in.innerHTML = ""
  element_to_be_fill_in.appendChild(element)
  element_to_remove.classList.remove("invisible")
  cwb_location_select.parentElement.classList.remove("is-loading")
}

// restorelocation
function restorelocation(){
  let data = localStorage.getItem("locationSelected")
  if (data){
    cwb_location_select.value = data
    model.mylocation = data
  } else {
    cwb_location_select.value = "新竹市"
    model.mylocation = "新竹市"
  }
}

// find location index
function find_location_index(element,locationNametosearch) {
  let locationNameIndex
  cwb_location_select = document.getElementById("cwb_location_select")
  for (let i = 0; i < element.length; i++) {
    let locationName = element[i].locationName
    if (locationNametosearch == locationName){
      locationNameIndex = i
    }
  }
  console.log("location index: ",locationNameIndex)
  return locationNameIndex
}

// use now weather state object to generate html code
function generate_now_weather(nowstate) {
  let div = document.createElement("div")
  div.innerHTML += `
  <nav class="level">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">降雨機率</p>
        <p class="title"><i class="fas fa-cloud-showers-heavy"></i> ${nowstate.PoP}%</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">最低溫度</p>
        <p class="title"><i class="fas fa-chevron-down"></i> ${nowstate.MinT}°C</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">最高溫度</p>
        <p class="title"><i class="fas fa-chevron-up"></i> ${nowstate.MaxT}°C</p>
      </div>
    </div>
  </nav>

  <div class="tile is-ancestor">
    <div class="tile is-12 is-parent">
      <div class="tile is-child box">
        <p class="title">${nowstate.Wx}</p>
      </div>
      <div class="tile is-child box">
        <p class="title">${nowstate.CI}</p>
      </div>
    </div>
  </div>
  `
  return div
}