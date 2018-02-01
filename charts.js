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
  //  console.log([selectedPop,totalPop,selectedPercent])
    
    var dataDescriptions = {}
    
    for(var i in sections){
        if(Object.keys(sections[i].Variables).length>3){
            var consolidatedData = drawBarChart(sections[i], sedata,selectedData)
            dataDescriptions[sections[i].Name]=consolidatedData
        }   
    }
    overview(dataDescriptions)
    drawDataMenu(sedata,selectedData)
   // drawChart(total)
    //console.log(sekey)
}
function overview(dataDescriptions){
    var text = "How is this area different?<br/>"
    for(var i in sections){
        var title = sections[i].Title
        var code = sections[i].Name
        var combinedData = dataDescriptions[code]
        console.log(title)
        console.log(combinedData)
    }
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
    //    if(key.split("_")[1]!="001"){
            var value = getTotalForVariable(i,data)
            formattedData[key]=value
      //  }
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


function processDifferences(selectedData,data){
    var formatted = {}
    
    var baseKey = Object.keys(data)[0].split("_")[0]
    var universeKey = baseKey+"_001"
    var uTotal = parseFloat(data[universeKey])
    var uSelected = parseFloat(selectedData[universeKey])
    
    var proportion = uSelected/uTotal
    
    
    for(var i in data){
        if(i.split("_")[1]!="001"){
            
        var total = parseFloat(data[i])
        var percentOfUniverse = total/uTotal
        var selected = parseFloat(selectedData[i])
        var percentOfUniverseSelected = selected/uSelected
        var percent = Math.round(selected/total*10000)/100
        var ifProportional = total*proportion
        var difference = selected-ifProportional
        formatted[i]={
            percentOfUniverse:percentOfUniverse,
            percentOfUniverseSelected:percentOfUniverseSelected,
            difference:difference,
            percent:percent,
            ifProportional:ifProportional,
            selected:selected,
            total:total
            }
        }
    }
    return formatted
}

function drawBarChart(sectionInfo, sedata,selectedSeData){
    var variables = sectionInfo.Variables
    var data = processWholeData(sedata,variables)
    var selectedData = processWholeData(selectedSeData,variables)
    
    var combined = processDifferences(selectedData,data)
    var ranked = getGreatestDifferences(combined)
    var oMax =  Object.keys(ranked).length
    var oScale = d3.scaleLinear()
        .domain([oMax,0])
        .range([0,.7])
    
    var margin = {"y":60,"x":200}
    var width = 160
    var spacer = 2
    var barWidth = 15
    var height = barWidth*Object.keys(data).length
    
    
    var max = d3.entries(combined).sort(function(a, b) { return d3.descending(a.value.total, b.value.total); })[0].value.total
    var yScale = d3.scaleLinear()
        .domain([0, max])
        .range([2,width])
    
    //
    var svg = d3.select("#chart").append("svg").attr("width",width+margin.x+30).attr("height",height+margin.y*2)
    
    svg.append("text").text(sectionInfo.Title).attr("x",20).attr("y",margin.y/3*2).attr("font-size",18)
        .attr("fill","rgba(113,142,224,1)")
var tooltipdiv = d3.select("body").append("div")
    .style("width","100px")	
    .style("background-color","rgba(255,255,255,.8)")	
    .style("padding","5px")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

var maxPercent = d3.entries(combined).sort(function(a, b) { return d3.descending(a.value.percent, b.value.percent); })[0].value.percent
var xAxisScale = d3.scaleLinear()
        .domain([0, maxPercent])
        .range([2,width])
var xAxis = d3.axisBottom(xAxisScale).ticks(7).tickFormat(function(d){console.log(d);return d+"%"})
    
    svg.append("g")
        .call(xAxis)
        .attr("transform","translate("+(margin.x)+","+(height+margin.y-15)+")")
svg.append("text")             
        .attr("transform","translate("+(margin.x+width/2)+","+(height+margin.y+20)+")")
      .style("text-anchor", "middle")
      .text("% of whole city");
           
    svg.selectAll("rect .whole")
        .data(Object.keys(combined))
        .enter()
        .append("rect")
        .attr("class",function(d){ return "whole "+d})
        .attr("fill","#fff")
        .attr("fill","rgba(113,142,224,1)")
        .attr("height",barWidth-spacer)
        .attr("width",function(d){return yScale(combined[d].total)})
        .attr("y",function(d,i){return i*barWidth})
        .attr("x",function(d){return 0})
        .attr("transform","translate("+(margin.x)+","+(margin.y)+")")
        .attr("opacity",function(d){
            if(ranked[d].rank==0 || ranked[d].rank==1 ){return 1}else{return .5}
        return oScale(ranked[d].rank)
        })
        .on("mouseover",function(d,i){
            var entry = combined[d]
            var rolloverText = processDifferenceText(entry)
            tooltipdiv.html(rolloverText)
            tooltipdiv.transition()		
            .style("opacity", .9);		
            tooltipdiv.style("left", function(){
                return (yScale(combined[d].total)+margin.x+20)+"px"
            })
            .style("top", (d3.event.pageY - 30) + "px");
        })
        .on("mouseout",function(d){
            tooltipdiv.transition()		
            .style("opacity", 0);
        })
        .attr("cursor","pointer")

    
    svg.selectAll("rect .selectedarea")
        .data(Object.keys(combined))
        .enter()
        .append("rect")
        .attr("class",function(d){ return "selectedarea "+d})
        .attr("fill","rgba(255,172,5,1)")
        .attr("height",barWidth-spacer)
        .attr("width",function(d){return yScale(combined[d].selected)})
        .attr("y",function(d,i){return i*barWidth})
        .attr("x",function(d){return 0})
        .attr("transform","translate("+(margin.x)+","+(margin.y)+")")
    .attr("opacity",function(d){
        if(ranked[d].rank==0 || ranked[d].rank==1 ){return 1}else{return .5}
        return oScale(ranked[d].rank)
    })
    .on("mouseover",function(d,i){
        var entry = combined[d]
        var rolloverText = processDifferenceText(entry)
        tooltipdiv.html(rolloverText)
        tooltipdiv.transition()		
        .style("opacity", .9);		
        tooltipdiv.style("left", function(){
            return (yScale(combined[d].total)+margin.x+20)+"px"
        })
        .style("top", (d3.event.pageY - 30) + "px");
    })
    .on("mouseout",function(d){
        tooltipdiv.transition()		
        .style("opacity", 0);
    })
        .attr("cursor","pointer")
    svg.selectAll("rect .proportional")
        .data(Object.keys(combined))
        .enter()
        .append("rect")
        .attr("class",function(d){ return "proportional "+d})
        .attr("fill","#333")
        .attr("height",barWidth-spacer)
        .attr("x",function(d){
            return yScale(combined[d].ifProportional)})
        .attr("y",function(d,i){return i*barWidth})
        .attr("width",function(d){return 1})
        .attr("transform","translate("+(margin.x)+","+(margin.y)+")")   
            .attr("opacity",function(d){
                if(ranked[d].rank==0 || ranked[d].rank==1 ){return 1}else{return .5}
                return oScale(ranked[d].rank)
            })
        .attr("cursor","pointer")
    svg.selectAll("text .label")
        .data(Object.keys(combined))
        .enter()
        .append("text")
        .attr("fill","rgba(113,142,224,1)")
        .attr("class",function(d){ return "label "+d})
        .text(function(d){return sectionInfo.Variables[d]})
        .attr("y",function(d,i){return i*barWidth+barWidth*.6})
        .attr("x",function(d){return -10})
        .attr("text-anchor","end")
        .attr("transform","translate("+(margin.x)+","+(margin.y)+")")
            .attr("opacity",function(d){
                if(ranked[d].rank==0 || ranked[d].rank==1 ){return 1}else{return .5}
                return oScale(ranked[d].rank)
            })
        .on("mouseover",function(d,i){
            var entry = combined[d]
            var rolloverText = processDifferenceText(entry)
            tooltipdiv.html(rolloverText)
            tooltipdiv.transition()		
            .style("opacity", .9);		
            tooltipdiv.style("left", function(){
                return (yScale(combined[d].total)+margin.x+20)+"px"
            })
            .style("top", (d3.event.pageY - 30) + "px");
        })
        .on("mouseout",function(d){
            tooltipdiv.transition()		
            .style("opacity", 0);
        })
        .attr("cursor","pointer")
        
        return {ranked:ranked,combined:combined}
}
function getGreatestDifferences(combined){
    var sorted = d3.entries(combined).sort(function(a, b) { 
        return d3.descending(Math.abs(a.value.difference), Math.abs(b.value.difference)); 
    })
    var ranked = {}
    for(var i in sorted){
     //   console.log([i,sorted[i].key,sorted[i].value.difference])
        ranked[sorted[i].key]={rank:i, difference:sorted[i].value.difference}
        
    }
    return ranked
}

function processDifferenceText(entry){    
    var rolloverText = Math.round(entry.percentOfUniverse*10000)/100+"% of the city's population<br/>"
    +Math.round(entry.percentOfUniverseSelected*10000)/100+"% of highlighted area's population"
    
   return rolloverText     
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
