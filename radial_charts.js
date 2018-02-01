$(function() {
	queue()
    .defer(d3.json,"socialExplorerKey_R11562182.json")
    .defer(d3.csv,"socialExplorer_R11562182_SL150.csv")
    .defer(d3.json,"blockGroupIdsVisible.json")
    .await(dataDidLoad);
})

function dataDidLoad(error,sekey,sedata,visiblebgid) {
    //console.log(sekey)
    //007_001 - total population
   
   
    var selectedData = filterByBgid(sedata,visiblebgid.bgids)
    var totalPopVar = "T002_001"
     var totalPop = getTotalForVariable(totalPopVar,sedata)
    var selectedPop = getTotalForVariable(totalPopVar,selectedData)
    selectedPercent = Math.round(selectedPop/totalPop*10000)/100
    console.log([selectedPop,totalPop,selectedPercent])
    //drawDataMenu(sedata,selectedData)
    
    drawRadialChart(sections[4], sedata,selectedData)    
   // drawChart(total)
    //console.log(sekey)
}

function filterByBgid(sedata,visiblebgid){
        selectedData = []
    for(var i in sedata){
        var area = sedata[i]
        var bgid = area["Geo_FIPS"]
        if(visiblebgid.indexOf(bgid)>-1){
            selectedData.push(area)
        }
    }
    return selectedData
}


function drawDataMenu(sedata,selectedData){
    var selectedColor = "red"
    var sectionColor = "gray"
    var rolloverColor = "black"
    var bandHeight = 20
    var svg = d3.select("#menu").append("svg").attr("width",600).attr("height",300)
    svg.selectAll("text")
        .data(sections)
        .enter()
        .append("text")
        .attr("class","section")
        .attr("fill",sectionColor)
        .text(function(d){return d.Title})
        .attr("x",bandHeight)
        .attr("y",function(d,i){return i*bandHeight+bandHeight})
        .on("mouseover",function(){
            d3.select(this).attr("fill",rolloverColor)
            d3.selectAll(".selected").attr("fill",selectedColor)
        })
        .on("mouseout",function(){
            d3.select(this).attr("fill",sectionColor)
            d3.selectAll(".selected").attr("fill",selectedColor)
        })
        .attr("cursor","pointer")
        .on("click",function(d){
            d3.selectAll(".section").attr("fill",sectionColor).attr("class","section")
            d3.select(this).attr("fill",selectedColor).attr("class","section selected")
            setupChart(d,sedata,selectedData)
        })
}

function processWholeData(data,variables){
    var formattedData = {}
    for(var i in variables){
        var key = i
        if(key.split("_")[1]!="001"){
            var value = getTotalForVariable(i,data)
            formattedData[key]=value
        }
    }
    return formattedData
}

function getTotalForVariable(variable,data){
    var code = "SE_"+variable
    var total = 0
    for(var i in data){
        if(isNaN(parseInt(data[i][code]))!=true){
            var value =parseInt(data[i][code])
            total = total+value   
        }
    }
    return total
}
function getOrderByData(data){
    var array = []
    for(var i in data){
        array.push({"code":i,"value":data[i]})
    }
    var sorted = array.sort(function(a,b){
        return b.value - a.value;
    });
    var order = {}
    for( var j in sorted){
        order[sorted[j]["code"]]=j
    }
    return order
}
function getPercents(data,selectedData){
    var percents = {}
    for(var i in data){
        var total = parseFloat(data[i])
        var selected = parseFloat(selectedData[i])
        var percent = Math.round(selected/total*10000)/100
        percents[i]=percent
    }
    return percents
}
function formatDataForRose(data, selectedData){
    var formatted = []
    for(var cat in data){
        console.log(cat)
        console.log(data[cat])
        console.log(selectedData[cat])
    }
    return formatted
}
function drawRadialChart(sectionInfo, sedata,selectedSeData){
    var variables = sectionInfo.Variables
    var data = processWholeData(sedata,variables)
    var selectedData = processWholeData(selectedSeData,variables)
    var percents = getPercents(data,selectedData)
    var order = getOrderByData(selectedData)
    
    
    var roseData = formatDataForRose(data, selectedData)
  //  console.log(data)
  //  console.log(selectedData)
  //  
    var svg = d3.select("#chart").append("svg").attr("width",500).attr("height",500)
    .append("g")
    .attr("transform", "translate(" + 500/2 + "," + 500/2 + ")");
    
    
    
}

function setupChart(sectionInfo, sedata,selectedData){
    var variables = sectionInfo.Variables
    if(Object.keys(variables).length==1){
        console.log("make heat chart")
    }
    else{
        console.log("make bar chart")
        drawBarChart(sectionInfo, sedata,selectedData)
    }
  
}
