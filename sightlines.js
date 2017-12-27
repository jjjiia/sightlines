$(function() {
	queue()
    .defer(d3.json,"statue_notBlocked_randomPointsTest.geojson")
    .await(dataDidLoad);
})
var statue = [-73.985428, 40.748817]
var center = statue
var scale = 210000
function dataDidLoad(error,buildings) {
     drawBuildings(buildings)
}
function drawHistogramAll(data,table,seDictionary){
    var width = 500
    var margin = 30
    var dataLength = Object.keys(data).length
    var barWidth = 20//width/dataLength
    var height = dataLength*barWidth
    var yScale = d3.scaleLinear().domain([0,100]).range([0,width])
    var svg = d3.select("#"+table+" svg")//.attr("width",width+250).attr("height",height+margin*2)
    var tablesInUseNames = {"T025":"Highest Level of Education Attained",
    "T007":"Age","T013":"Race",
    "T056":"Household Income",
    "T128":"Mode of Transportation"}
    svg.append("text").text(tablesInUseNames[table]).attr("x",20).attr("y",20)
    
    svg.selectAll(".barAll")
        .data(Object.keys(data))
        .enter()
        .append("rect")
        .attr("y",function(d,i){
            return i*barWidth+margin
        })
        .attr("x",function(d){
            return yScale(data[d])+210
        })
        .attr("width",function(d){
            return 2
        })
        .attr("height",barWidth-2)
        .attr('fill',"#638ccc")
        .attr("opacity",.8)
        .attr("class","barAll")
        
    
}
function drawHistogram(data,table,seDictionary){
    var width = 500
    var margin = 30
    var dataLength = Object.keys(data).length
    var barWidth = 20//width/dataLength
    var height = dataLength*barWidth
    var yScale = d3.scaleLinear().domain([0,100]).range([0,width])
    var svg = d3.select("#charts").append("div").attr("id",table).append("svg").attr("width",width+250).attr("height",height+margin*2)
    svg.selectAll(".bar")
        .data(Object.keys(data))
        .enter()
        .append("rect")
        .attr("y",function(d,i){
            return i*barWidth+margin
        })
        .attr("x",function(d){
            return 210
        })
        .attr("width",function(d){
            return yScale(data[d])
        })
        .attr("height",barWidth-2)
        .attr('fill',"#57e5a3")
        .attr("opacity",.3)
        
    var yAxis = d3.axisBottom(yScale).ticks(5)
        .tickFormat(function(d){return d+"%"})
        .tickSize(height)
        
    var axis = svg.append("g")
        .attr("transform","translate(210,"+margin+")")
        .attr("class","axis")
        .call(yAxis)
    axis.select(".domain").remove()
        
    svg.selectAll(".bar")
        .data(Object.keys(data))
        .enter()
        .append("text")
        .text(function(d){return getTitle(d,seDictionary).split(":")[1]})
        .attr("x",200)
        .attr("y",function(d,i){
            return i*barWidth+margin+15
        })
        .attr("font-size",11)
        .attr('fill',"#aaa")
        .attr("text-anchor","end")
    svg.selectAll(".bar")
        .data(Object.keys(data))
        .enter()
        .append("text")
        .text(function(d){return data[d]+"%"})
        .attr("x",function(d){
            return yScale(data[d])+213
        })
        .attr("y",function(d,i){
            return i*barWidth+margin+15
        })
        .attr("font-size",11)
        .attr('fill',"#57e5a3")
}
function makeTableDictionary(seDictionary){
    var formatted = {}
    for(var i in seDictionary){
        var key = i
        var table = i.split("_")[0]
        if(Object.keys(formatted).indexOf(table)>-1){
            formatted[table].push({key:key,name:seDictionary[key]})
        }else{
            formatted[table]=[]
            formatted[table].push({key:key,name:seDictionary[key]})
        }
    }
    return formatted
}
function getTotal(code,visibleData){
    var data = getChartData(code,visibleData)
    var total = 0
    for(var j in data){
        if(isNaN(data[j])!=true){
            total+=parseInt(data[j])
        }
    }
    return total
}
function removeNoPopulationBlockGroups(visibleData){
    var populationCode = "T001_001"
    var populationData = getChartData("T001_001",visibleData)
    for(var j in populationData){
        if(populationData[j]==0){
            d3.select("._"+j).remove()
        }
    }
}
function getTitle(code,seDictionary){
    return seDictionary[code]
}
function getChartData(code,data,mode){
    var codeData = {}
    for(var id in data){
        var gid = data[id]["Geo_FIPS"]
        var totalCode = code.split("_")[0]+"_001"
        var total = parseFloat(data[id]["SE_"+totalCode])
        var value = parseFloat(data[id]["SE_"+code])
        var percent = Math.round(value/total*10000)/100
    //    console.log([totalCode,code])
      //  console.log([total,value,percent])
        var totalPopulationCode ="T002_001"
        if(total!=0&&total!=undefined){
            if(mode == "percent"){
                codeData[gid]=percent
            }else{
                codeData[gid]=value
            }
        }
    }
    return codeData
}
function seDataDictionary(data){
    var formattedData = {}
    for(var i in data){
        var gid = data[i]["Geo_FIPS"]
        formattedData[gid]=data[i]
    }
    return formattedData
    //Geo_FIPS
}
function drawScale(){
	var projection = d3.geoMercator().scale(scale).center(center)
    
}
function drawBlockGroups(geoData){
	var projection = d3.geoMercator().scale(scale).center(center)
	var path = d3.geoPath().projection(projection);
    var width = $("#map").width()
    var height = $("#map").height()
    var code = "test"
    var svg = d3.select("#map").append("svg")
    .attr("width",width).attr("height",height).attr("class",code)
   // drawBaseMap(code)
    
    var colorScale = d3.scaleLinear().domain([0,200]).range(["red","green"])
    
	svg.selectAll(".buildings")
		.data(geoData.features)
        .enter()
        .append("path")
		.attr("d",path)
        .attr("stroke-width", 1)
		.style("fill",function(d){
         //   console.log(d)
            var gl = parseFloat(d.properties.groundelev)
            var bh = parseFloat(d.properties.heightroof)
            var th = gl+bh
           // return colorScale(th)
           return "red"
		})
        //.attr("transform","translate(0,150)")
}
function drawTestPointsInPoly(geoData,randomPoints){
    var randomIndex = Math.round(Math.random()*Object.keys(randomPoints).length)
    console.log(randomIndex)
    var testId = Object.keys(randomPoints)[randomIndex]
    console.log(testId)

   var testPoints = randomPoints[testId]
    console.log(testPoints)
    var center = testPoints[0]
	var projection = d3.geoMercator().scale(scale).center(center)
   var svg = d3.select("#map").append("svg").attr("width",600).attr("height",600)
var path = d3.geoPath().projection(projection);
    svg.selectAll(".buildings")
    	.data(geoData.features)
        .enter()
        .append("path")
    	.attr("d",path)
    	.style("fill",function(d){
            var did = d["properties"]["doitt_id"]
            if(did == testId){
                return "#ccc"}
            else{
                return "none"
            }
    	})
    	.style("stroke",function(d){
            var did = d["properties"]["doitt_id"]
            if(did == testId){
                return "black"}
            else{
                return "#aaa"
            }
    	})
        for(var p in testPoints){
            var lng = testPoints[p][0]
            var lat = testPoints[p][1]
            console.log([lat,lng])
            svg.append("circle")
            .attr("r",1)
            .attr("cx",function(){
                return projection([lng,lat])[0]
            })
            .attr("cy",function(){
                return projection([lng,lat])[1]
            })
        }
    	
}
function drawBuildings(geoData){

    
    var colorScale = d3.scaleLinear().domain([0,100]).range(["white","green"])
    //need to generalize projection into global var later
    
	var projection = d3.geoMercator().scale(scale).center(center)
    //d3 geo path uses projections, it is similar to regular paths in line graphs
	var path = d3.geoPath().projection(projection);
    
    //push data, add path
    var svg = d3.select("#map").append("svg").attr("width",500).attr("height",500)
	svg.selectAll(".buildings")
		.data(geoData.features)
        .enter()
        .append("path")
		.attr("d",path)
		.style("stroke",function(d){
		  // return "#aaa"
           return "none"
		})
		.style("fill",function(d){
            var did = d["properties"]["doitt_id"]
            //var a = fruits.indexOf("Apple");
           return "red"
		})
		.attr("class",function(d){
            //return "perspective"
            return  "_"+d["properties"]["doitt_id"]
           
		})
        .on("mouseover",function(d){
            console.log(d)
            var year = d.properties.cnstrct_yr
            var id = d.properties.doitt_id
            var bheight = d.properties.heightroof
            var gelevation = d.properties.groundelev
            if(seenIdsArray.indexOf(id)>-1){
                var seen = "True"
            }else{
                var seen = "False"
            }
            var text = "<strong>Building ID: </strong>"+id+"<br/>"
            +"<strong>Constructed in: </strong>"+year+"<br/>"
            +"<strong>Building Height: </strong>"+bheight+"<br/>"
            +"<strong>Ground Elevation: </strong>"+gelevation+"<br/>"
            +"<strong>Can be seen: </strong>"+seen+"<br/>"
            d3.select("#buildingInfo").html(text)
        })
}
function drawBaseMap(className){
    var width = $("#map").width()
    var tiler = d3.tile()
        .size([width,width]);
	var projection = d3.geoMercator().scale(scale).center(center)
    var path = d3.geoPath()
        .projection(projection);

    var svg = d3.select("."+className).append("g")
      

    svg.selectAll("path")
        .data(tiler
          .scale(projection.scale() * 2 * Math.PI)
          .translate(projection([0, 0])))
      .enter().append("g")
        .each(function(d) {
          var g = d3.select(this);
          d3.json("https://vector.mapzen.com/osm/roads/" + d[2] + "/" + d[0] + "/" + d[1] + ".json?api_key=mapzen-DoPocQK", function(error, json) {
            if (error) throw error;

            g.selectAll("path")
              .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key; }))
            .enter().append("path")
            .attr("stroke-width",0.2)
              .attr("class", function(d) { return d.properties.kind+" basemap"; })
              .attr("d", path);
          });
        });
}
