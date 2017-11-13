processSearchFromIndex()

$('#document-list').on('click', 'li', function(event) {
	event.stopPropagation();
    $(event.target).children('ul').slideToggle();
});

$(function() {
	$('input').each(function() {
		$(this).keypress(function(e) {
			if (e.which == 10 || e.which == 13) {
				processSearchBox();
			}
		})
	})
})

function getDataFromServer(keyword) {
	document.getElementById("firstItem").innerHTML = "Searching in progress, it takes awhile as the documents are large";
	var doc = document.getElementById("document-list")
	while (doc.children.length > 1) {
		doc.removeChild(doc.lastChild);
	}

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
	    	// console.log(data);
			var data_hits = data.hits.hits.length;
			while (doc.firstChild) {
				doc.removeChild(doc.firstChild);
			}

	    	for (var i=0; i<data_hits; i++) {
	    		var course = document.createElement("li");
	    		course.setAttribute("class", "list-group-item");
	    		course.innerHTML = data.hits.hits[i]._source.name;
	    		course.onclick = $(this).children('ul').slideToggle();
	    		console.log(data.hits.hits[i]._source.name);
	    		if (i==0) {
	    			course.setAttribute("id", "firstItem");
	    		}

		    	var file_group = document.createElement("ul");
		    	file_group.setAttribute("class", "list-group");
		    	course.appendChild(file_group);
		    	doc.appendChild(course);

		    	var docs_length = data.hits.hits[i].inner_hits.docs.hits.hits.length;
		    	for (var j=0; j<docs_length; j++) {
		    		var highlight = data.hits.hits[i].inner_hits.docs.hits.hits[j].highlight;
			    	var child_doc = highlight['docs.name'];

			    	var child_li = document.createElement("li");
	    			child_li.innerHTML = child_doc;
	    			child_li.setAttribute("class","list-group-item");
	    			file_group.appendChild(child_li);

	    			var doc_content = highlight['docs.content'];

			    	var content_group = document.createElement("ul");
			    	content_group.setAttribute("class", "list-group");
			    	child_li.appendChild(content_group);

			    	if (doc_content == undefined) {
				    	var content_li = document.createElement("li");
				    	content_li.innerHTML = "search text only found in title";
		    			content_li.setAttribute("class","list-group-item");
		    			content_group.appendChild(content_li);

			    		continue;
			    	}

	    			for (var k=0; k<doc_content.length; k++) {
	    				var doc_content_text = doc_content[k];

				    	var content_li = document.createElement("li");
				    	content_li.innerHTML = doc_content_text;
		    			content_li.setAttribute("class","list-group-item");
		    			content_group.appendChild(content_li);
	    			}
		    	}
	    	}
	    	if (data_hits == 0) {
	    		var course = document.createElement("li");
	    		course.setAttribute("class", "list-group-item");
	    		course.innerHTML = "Sorry, no results found";

	    		doc.appendChild(course);
	    	}
			setTimeout(hideChild, 1);
	    },
	    error: function(error) {
	    	console.log("error");
	    	console.log(error);
	    }
	});
}

function hideChild() {
	$(document).ready(function() {
	    $('.list-group').toggle();
	});
}

function processSearchFromIndex() {
	var address = window.location.href;
	var arr = address.split("?")

	var search = arr[1];
	if (search != undefined) {
		getDataFromServer(search);		
	}
}

function processSearchBox() {
	$(document).ready(function() {
		var searchbox = document.getElementById("search-box");
		getDataFromServer(searchbox.value);		
	})
}

function getData(keyword) {
	var json = {
  "_source": {
    "includes": ["name", "url"],
    "excludes": ["*.*"]
  },
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "name": keyword
          }
        },
        {
          "nested": {
            "path": "docs",
            "score_mode": "sum",
            "query": {
              "multi_match": {
                "type": "most_fields",
                "query": keyword,
                "fields": ["docs.name", "docs.content"]
              }
            },
            "inner_hits": {
              "_source" : false,
              "highlight": {
                "fields": {
                  "docs.name": {
                    "no_match_size": 100
                  },
                  "docs.content": {
                    "number_of_fragments" : 1
                  }
                }
              }
            }
          }
        }
      ]
    }
  }
}
	return JSON.stringify(json);
}


function geturl() {
	var path = 'https://c3de74b0a9b122f7cb595f9720e26dfe.us-east-1.aws.found.io/moocs_l/course/_search?pretty'

	return path
}
