'use strict';
(function(){
    var app ={
        vars :{
            searchTarget: "http://localhost:3000/api/companies",
            lastSearchTerm : "",
            lastSearch: null, //will track the time we last ran our search
            totalLoaded: 0,
            previouslyLoaded: 0
        },
        data:{
            searchResults: []
        },

        events : function(){
            document.getElementById('results').addEventListener('scroll', function(){
                if(this.scrollTop + this.clientHeight >= this.scrollHeight){

                    app.startSearch();
                }
            });
            document.getElementById('searchBox').addEventListener("keyup", app.startSearch);
            var viewBtns = document.getElementsByClassName('view-btn');
            for(var i = 0; i < viewBtns.length; i++){
                viewBtns[i].addEventListener("click", function(event){

                    var pos = event.target.classList[1];
                    var item = app.data.searchResults.results[pos];
                    app.showCompany(item);

                });
            }
        },

        startSearch : function(event){

            //clear search results
            var queryText = document.getElementById('searchBox').value;
            if(queryText){
                if(app.vars.lastSearch != null){
                    clearTimeout(app.vars.lastSearch);
                } 
                app.vars.lastSearch = setTimeout(function(){ app.queryAPI(queryText)}, 1000);
            }
        },
        queryAPI: function(searchTerm){

                app.vars.lastSearch = null;
                var queryString = "";
                queryString += "q="+searchTerm;
                var newSearch = true;
                if(app.vars.totalLoaded > 0 && app.vars.lastSearchTerm == searchTerm){
                    //There's already been data loaded, let's start from a different position
                    queryString += "&start="+ (app.vars.totalLoaded);
                    newSearch = false;
                }
                queryString += "&limit=20";
                var fetchUrl = app.vars.searchTarget+"?"+queryString;
                var options = {};
                return app.vars.searching = fetch(fetchUrl, options)
                    .then(res => {
                        return res.json();               
                    }).then(data =>{

                        app.vars.lastSearchTerm = searchTerm;
                        if(app.vars.totalLoaded>0 && app.vars.lastSearchTerm == searchTerm){
                            //There's already previous search results so we'll add to whats already there
                            app.vars.previouslyLoaded = app.vars.totalLoaded;
                            app.vars.totalLoaded = app.vars.totalLoaded + data.results.length;
                            var newResults = app.data.searchResults.results.concat(data.results);
                            app.data.searchResults.results = newResults;
                        }else{
                            //This is the first time so we can just throw everything in directly
                            app.vars.totalLoaded = data.results.length;
                            app.data.searchResults = data;

                        }
                        if(data.total == 0){
                            return app.noResults();
                        }
                        app.showResults(newSearch);
                    });  
        },
        showResults : function(newSearch){
            if(newSearch){
                //Clear the results area if this is new
                document.getElementById('results').innerHTML= "";
                document.getElementById('viewPane').innerHTML = "Choose a company on the left for details";
            }
            
            for(var i = app.vars.previouslyLoaded; i < app.data.searchResults.results.length; i++){
                var node = document.createElement("div");
                var text = document.createTextNode(app.data.searchResults.results[i].name);
                var btnNode = document.createElement("button");
                var btnText = document.createTextNode("View");
                node.appendChild(text);
                btnNode.appendChild(btnText);
                btnNode.className = "view-btn "+i;
                node.appendChild(btnNode);
                document.getElementById('results').appendChild(node);
            }
            //rewire the event listeners
            app.events();
        },
        noResults : function(){
                var node = document.createElement("div");
                var text = document.createTextNode("Sorry we have no results for that company");
                node.appendChild(text);
                document.getElementById('results').innerHTML = "";
                document.getElementById('results').appendChild(node);
        },
        showCompany:function(company){
            var node = document.createElement("div");
            var lineBreak = function(){
                return document.createElement("br");
            }; 
            var image = document.createElement("img");
            image.src = company.avatarUrl;
            node.appendChild(image);
            node.appendChild(lineBreak());
            node.className ="company";

            var companyName = document.createTextNode("Company Name: "+company.name);
            node.appendChild(companyName);
            node.appendChild(lineBreak());
            var phone = document.createTextNode("Phone: "+company.phone);
            node.appendChild(phone);
            node.appendChild(lineBreak());
            var website = document.createTextNode("Website: "+company.website);
            node.appendChild(website);
            node.appendChild(lineBreak());
            var laborStr = "";
            for(var i = 0; i < company.laborType.length; i++){
                laborStr+= company.laborType[i];
                if(i !== (company.laborType.length -1)){
                    laborStr += ", ";
                }
            }
            var laborNode = document.createTextNode("Labor Type: "+laborStr);
            node.appendChild(laborNode);
            node.appendChild(lineBreak());           
        
            document.getElementById("viewPane").innerHTML = "";
            document.getElementById("viewPane").appendChild(node);
        },
        init : function(){
            //Wire up our event listeners
            app.events();

        }

    };

    app.init();
})();