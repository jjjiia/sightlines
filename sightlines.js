$(function() {
	queue()
        .defer(d3.json, "randomPoints.geojson")
        .defer(d3.csv, "notBLocked_RandomPointsTest.csv")
        .defer(d3.csv,"BlockGroupsWithView.csv")
        .defer(d3.json,"blockgroups_2.geojson")
        .defer(d3.csv,"socialExplorer.csv")
    	.defer(d3.json,"socialExplorer_metadata.json")
    	.defer(d3.json,"tables_dictionary_now.json")
        .await(dataDidLoad);
})
var statue = [-74.044502, 40.699247]

var center = statue
var scale = 140000
function dataDidLoad(error,nyc,points,bgIds,bgs,se,seDictionary,seTables) {
 //   console.log(nyc)
 //   console.log(nyc2)
    var width = $("#map").width()
    var mapSvg = d3.select("#map").append("svg").attr("width",width).attr("height",600)
    //drawLines(lines)
    var blocked = []
	var projection = d3.geoMercator().scale(scale).center(center)
   // drawTestPointsInPoly(nyc,randomPoints)
    drawBlockGroups(bgs,"#aaa")
    drawBuildings(nyc,"#aaa",points)
    drawBaseMap()
    
    var seData = seDataDictionary(se)
    var visibleData = {}
    for(var i in bgIds){
        d3.select("._"+bgIds[i].bgid).style("fill","#57e5a3").attr("opacity",.2)
        visibleData[bgIds[i].bgid] = seData[bgIds[i].bgid]
    }

    removeNoPopulationBlockGroups(visibleData)
    var totalPopulation = getTotal("T001_001",visibleData)
    var totalArea = getTotal("T003_001",visibleData)
    var bgs = Object.keys(visibleData).length
    var buildings = points.length
    var info = d3.select("#info").html("<span style=\"color:red\">&#9830 Buildings</span>"+" There are <strong>"+buildings
    +" </strong> buildings from which the statue is visible.<br/><br/>"
    +"<span style=\"color:#57e5a3\">&#9830 Census Block Groups</span> These buildings fall into <strong>"+bgs+" </strong> Census Block Groups, a total of <strong>"
    +totalArea+ " </strong> square miles with  <strong>"
    +totalPopulation+" </strong> residents.")
    
    var tablesInUse = ["T025","T007","T013","T056","T128"]
    
    var tableDictionary = makeTableDictionary(seDictionary)
    d3.select("#charts").append("div").attr("class","title").html("The view from the statue:")
    d3.select("#charts").append("div").attr("class","key").html("<span style=\"color:#57e5a3\">&#9830 Block Groups containing sightlines</span>"
    +"<br/><span style=\"color:#638ccc\">&#9830 All Block Groups</span><br/><br/>")
    for(var t in tablesInUse){
        var tableData = {}
        var allData = {}
        var table = tablesInUse[t]
        var total = getTotal(table+"_001",visibleData)
        for(var c in tableDictionary[table]){
            var code = tableDictionary[table][c].key
            if(code.split("_")[1]!="001"){
                var value = parseInt(getTotal(code,visibleData))
                var percent = Math.round(value/total*10000)/100
                tableData[code]= percent
            }
        }
        drawHistogram(tableData,table,seDictionary)
        
        var totalAll = getTotal(table+"_001",seData)
        
        for(var c in tableDictionary[table]){
            var code = tableDictionary[table][c].key
            if(code.split("_")[1]!="001"){
                var value = parseInt(getTotal(code,seData))
                var percent = Math.round(value/totalAll*10000)/100
                allData[code]= percent
            }
        }
        drawHistogramAll(allData,table,seDictionary)
    }
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
function getChartData(code,data){
    var codeData = {}
    for(var id in data){
        codeData[id]=data[id]["SE_"+code]
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
function drawBlockGroups(geoData,color){
    var seenIdsArray = []
    
    var colorScale = d3.scaleLinear().domain([0,100]).range(["white","green"])
    //need to generalize projection into global var later
    
	var projection = d3.geoMercator().scale(scale).center(center)
    //d3 geo path uses projections, it is similar to regular paths in line graphs
	var path = d3.geoPath().projection(projection);
    
    //push data, add path
    var svg = d3.select("#map svg")
	svg.selectAll(".buildings")
		.data(geoData.features)
        .enter()
        .append("path")
		.attr("d",path)
        .attr("stroke-width",2)
		.style("stroke",function(d){
		  // return "#aaa"
           return "#fff"
		})
		.style("fill",function(d){
            var did = d["properties"]["GEOID"]
            //var a = fruits.indexOf("Apple");
           return "none"
		})
		.attr("class",function(d){
            //return "perspective"
            return  "_"+d["properties"]["GEOID"]
           
		})
        .on("mouseover",function(d){
            console.log(d["properties"]["GEOID"])
        })
        
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
function drawBuildings(geoData,color,points){
    var seenIdsArray = []
     for(var i in points){
         seenIdsArray.push(points[i].ids)
     }
    
    var colorScale = d3.scaleLinear().domain([0,100]).range(["white","green"])
    //need to generalize projection into global var later
    
	var projection = d3.geoMercator().scale(scale).center(center)
    //d3 geo path uses projections, it is similar to regular paths in line graphs
	var path = d3.geoPath().projection(projection);
    
    //push data, add path
    var svg = d3.select("#map svg")
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
function drawBaseMap(){
    var width = $("#map").width()
    var tiler = d3.tile()
        .size([width,width]);
	var projection = d3.geoMercator().scale(scale).center(center)
    var path = d3.geoPath()
        .projection(projection);

    var svg = d3.select("#map svg").append("g")
      

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
