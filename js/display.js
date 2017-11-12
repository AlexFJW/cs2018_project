getDataFromServer('nlp');
function getDataFromServer(keyword) {
	document.getElementById("firstItem").innerHTML = "Searching in progress, it takes awhile as the documents are large";
	$.ajax({
	    url: geturl(),
	    beforeSend: function(xhr) { 
	      xhr.setRequestHeader("Authorization", "Basic " + btoa("elastic:GuGs9GAnAYb83UA5kWl6H937")); 
	    },
	    type: 'POST',
	    dataType: 'json',
	    contentType: 'application/json',
	    processData: false,
	    data: getData(keyword),
	    success: function (data) {
	    	console.log("data");
	    	console.log(data);
			var ul = document.getElementById("document-list");
	    	if (data.hits.total > 0) {
	    		document.getElementById("firstItem").innerHTML = data.hits.hits[0]._source.name;
	    	}else {
	    		document.getElementById("firstItem").innerHTML = "Sorry, no results found";
	    	}
	    	for (var i=1; i<data.hits.total;i++) {
  				var li = document.createElement("li");	
  				li.appendChild(document.createTextNode(data.hits.hits[i]._source.name));
  				li.setAttribute("class", "list-group-item");
  				ul.appendChild(li);
	    		console.log("docs");
	    		console.log(data.hits.hits[i]._source.docs.length);
	    		for (var j=0;j<2;j++) {
	    			console.log(data.hits.hits[i]._source.docs[j].name)
	    		}
	    	}

	    },
	    error: function(error) {
	    	console.log("error");
	    	console.log(error);
	    }
	});


}

function processSearchFromIndex() {
	var address = window.location.href;
	var arr = address.split("?")

	var search = arr[1];
	getDataFromServer(search);
}




function getData(keyword) {
	var json = {
		"_source": {
			"_includes": ["name", "url"],
			"_excludes": ["*.*"]
		},
		"query": {
			"bool": {
			 	"should": [
			    {
			    	"match": {
			       		"name": "sample"
			      	}
			    },
			    {
			      	"nested": {
			        	"path": "docs",
				        "score_mode": "sum",
				        "query": {
				          	"multi_match": {
					            "type": "most_fields",
					            "query": "sample",
					            "fields": ["docs.name", "docs.content"]
			          		}
			        	},
				        "inner_hits": {
				          	"_source" : false,
					        	"highlight": {
						            "fields": {
							            "docs.name": {
							                "no_match_size": 100,
							                "number_of_fragments" : 1
					              		},
				            	  		"docs.content": {}
				            		}
				          		}
				        	}
			      		}
			    }]
			}
		}
	}
	var test = {"query": {"match": {"name": keyword}}}

	return JSON.stringify(test);
}


function geturl() {
	var path = 'https://c3de74b0a9b122f7cb595f9720e26dfe.us-east-1.aws.found.io/moocs/course/_search'

	return path
}

function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return 'Basic ' + hash;
}
document.getElementById("firstItem").innerHTML