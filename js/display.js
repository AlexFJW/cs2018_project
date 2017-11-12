// getDataFromServer('nlp');
console.log("test");
getDataFromServer("")


$('.list-group-item').click(function(event) {
	event.stopPropagation();
	console.log(event.target);
    $(event.target).children('ul').slideToggle();
});

function getDataFromServer(keyword) {
	console.log("inside data");
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
	    	// console.log(data);
			var first_doc = document.getElementById("firstItem");
	    	if (data.hits.total > 0) {
	    		console.log("first doc");
	    		first_doc.innerHTML = data.hits.hits[0]._source.name;
	    		console.log(data.hits.hits[0]._source.name);
		    	var child_group = document.createElement("ul");
		    	child_group.setAttribute("class", "list-group");
		    	first_doc.appendChild(child_group);

		    	var docs_length = data.hits.hits[0].inner_hits.docs.hits.hits.length;
		    	for (var i=0;i<docs_length;i++) {
		    		console.log('highlight');
		    		var highlight = data.hits.hits[0].inner_hits.docs.hits.hits[i].highlight;
		    		console.log(highlight);
			    	var child_doc = highlight['docs.name'];

			    	var child_li = document.createElement("li");
	    			child_li.appendChild(document.createTextNode(child_doc));
	    			child_li.setAttribute("class","list-group-item");
	    			child_group.appendChild(child_li);

	    			var doc_content = highlight['docs.content'];
			    	var content_group = document.createElement("ul");
			    	content_group.setAttribute("class", "list-group");
			    	child_li.appendChild(content_group);

	    			for (var j=0;j<doc_content.length;j++) {
	    				var doc_content_text = doc_content[j];

				    	var content_li = document.createElement("li");
				    	content_li.innerHTML = doc_content_text;
		    			content_li.setAttribute("class","list-group-item");
		    			content_group.appendChild(content_li);
	    			}

		    	}
		    	$(document).ready(function () {
				    $('.list-group').toggle();
				});
	    	}else {
	    		first_doc.innerHTML = "Sorry, no results found";
	    	}



			// var ul = document.getElementById("document-list");

	  //   	// course name
	  //   	for (var i=1; i<1;i++) {
  	// 			var li = document.createElement("li");
  	// 			li.appendChild(document.createTextNode(data.hits.hits[i]._source.name));
  	// 			console.log(data.hits.hits[i]._source.name);
  	// 			li.setAttribute("class", "list-group-item");
	  //   	// 	console.log("docs");

	  //   	// documents in course
	  //   		docs_length = data.hits.hits[i].inner_hits.docs.hits.total;
	  //   		console.log(docs_length);
	  //   		var child_ul = document.createElement("ul");
	  //   		child_ul.setAttribute("class", "list-group");
	  //   		for (var j=0;j<1;j++) {
	  //   			var doc_name = data.hits.hits[i].inner_hits.docs.hits.hits[j].highlight['docs.name'];
	  //   			console.log(doc_name);
	  //   			var child_li = document.createElement("li");
	  //   			child_li.appendChild(document.createTextNode(doc_name));
	  //   			child_li.setAttribute("class","list-group-item");
	  //   			child_ul.appendChild(child_li);
	  //   			li.appendChild(child_ul);
	  //   		}
  	// 			ul.appendChild(li);
	  //   	}

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
    "includes": ["name", "url"],
    "excludes": ["*.*"]
  },
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "name": "QR decomposition"
          }
        },
        {
          "nested": {
            "path": "docs",
            "score_mode": "sum",
            "query": {
              "multi_match": {
                "type": "most_fields",
                "query": "QR decomposition",
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

	var test = {"query": {"match": {"name": keyword}}}

	return JSON.stringify(json);
}


function geturl() {
	var path = 'https://c3de74b0a9b122f7cb595f9720e26dfe.us-east-1.aws.found.io/moocs_l/course/_search?pretty'

	return path
}

function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return 'Basic ' + hash;
}

document.getElementById("firstItem").innerHTML