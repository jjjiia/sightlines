$(function() {
	queue()
        .defer(d3.json, "5MileRadius_footprints.geojson")
        .defer(d3.json, "Building_Footprints_2017s.geojson")
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
var scale = 240000
function dataDidLoad(error,nyc,nyc2,points,bgIds,bgs,se,seDictionary,seTables) {
 //   console.log(nyc)
 //   console.log(nyc2)
    console.log(seDictionary)
    var width = $("#map").width()*.9
    var mapSvg = d3.select("#map").append("svg").attr("width",width).attr("height",width)
    //drawLines(lines)
    var blocked = []
	var projection = d3.geoMercator().scale(scale).center(center)
   // drawTestPointsInPoly(nyc,randomPoints)
    drawBlockGroups(bgs,"#aaa")
    drawBuildings(nyc,"#aaa",points)
    var seData = seDataDictionary(se)
    var visibleData = {}
    for(var i in bgIds){
        d3.select("._"+bgIds[i].bgid).style("fill","#57e5a3").attr("opacity",.3)
        visibleData[bgIds[i].bgid] = seData[bgIds[i].bgid]
    }
    removeNoPopulationBlockGroups(visibleData)
    var totalPopulation = getTotal("T001_001",visibleData)
    var totalArea = getTotal("T003_001",visibleData)
    var bgs = Object.keys(visibleData).length
    var buildings = points.length
    d3.select("#info").html(" <strong>"+buildings
    +" </strong> buildings <br/><br/><strong>"+bgs+" </strong> Census Block Groups <br/>over  <strong>"
    +totalArea+ " </strong> square miles <br/>with  <strong>"
    +totalPopulation+" </strong> residents.")
        
    for(var c in seDictionary){
        //console.log(getChartData(c,visibleData))
        //console.log(getTitle(c,seDictionary))
        //console.log(c)
        break
    }
    ////drawBuildings(nyc2,"#aaa")
    drawBaseMap()
    for(var i in points){
        d3.select("._"+points[i].ids).style("fill","red").style("stroke","none")
    }
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
		.style("stroke",function(d){
		  // return "#aaa"
           return "none"
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
           return "none"
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
