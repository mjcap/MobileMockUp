"use strict";

var tmdDevice = new Object();


//	    userObject.assignedUser
//	    userObject.password
//	    userObject.server
//	    userObject.port
//	    userObject.dept
//          userObject.checklist
//          userObject.check

var userObject = new Object();

var endPoints = [ "SPX@getDeptsForUser", "SPX@getCheckLists", "SPX@getChecks", "SPX@setTemp", "SPX@setData" ];


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
	document.addEventListener("backbutton", this.onBackKeyDown, false);
    },
    onBackKeyDown:  function() {
	var parmArrToGoBack = new Array();
	// Handle the back button
	/*
             if currentPage is loginDivId then exit
             if currentPage is index
             if currentPage is tempTask then show index 
        */
	var currentPageId = $.mobile.pageContainer.pagecontainer( 'getActivePage' ).attr( 'id' );

	var newParmObj = new Object();
	
	if (currentPageId === "loginDivId"){
	    //neither of these work...
	    //navigator.device.exitApp();
	    //device.app.exitApp();
	}
	else if (currentPageId === "index"){
	    //userObject.dept
	    //          .checklists
            //          .checks

	    //TODO find out if this condition can ever happen?
	    if ('check' in userObject){
		delete userObject.check;
                newParmObj.userName = userObject.assignedUser;
	        newParmObj.dept = userObject.dept;
		newParmObj.checklist = userObject.checklist;
		app.post(endPoints[2], userObject.server, userObject.password, userObject.port, newParmObj, app.displayChecks);	
	    }
	    else if ('checklist' in userObject){
		delete userObject.checklist;
                newParmObj.userName = userObject.assignedUser;
	        newParmObj.dept = userObject.dept;
		app.post(endPoints[1], userObject.server, userObject.password, userObject.port, newParmObj, app.displayChecklists);
	    }
	    else if ('dept' in userObject){
		delete userObject.dept;
		newParmObj.userName = userObject.assignedUser;
		app.post(endPoints[0], userObject.server, userObject.password, userObject.port, newParmObj, app.displayDept);
	    }
	    else{
		$.mobile.changePage("#loginDivId", { transition: 'slide' });
	    }
	    
	}
	else if (currentPageId === "tempTask"){
	    delete userObject.check;
	    $.mobile.changePage("#index", { transition: 'slide' });
	}
	else if (currentPageId === "nonTempTask"){
	    delete userObject.check;
	    $.mobile.changePage("#index", { transition: 'slide' });
	}
    },   
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
	console.log("MobileMockUp2 in onDeviceReady() after calling app.receivedEvent()");

	var onSuccess = function(someData){
	    
	    //someData=[{"address":"00:40:B3:8C:5F:16","name":"PAR-TMD200-5F16"}]
	    console.log("MobileMockUp onDeviceReady().getPaired() onSuccess() someData=["+JSON.stringify(someData)+"]");
	    
	    if (someData.length > 0){
		
	        var onDiscoveredUuids = function(deviceWithUuid){
	          console.log("MobileMockUp ognDeviceiscovered() onDeviceDiscoveredGotUuids=["+JSON.stringify(deviceWithUuid)+"]");
		  if (('uuids' in deviceWithUuid) && (deviceWithUuid.uuids.length > 0) && (deviceWithUuid.uuids[0].trim() != "")){	
	            tmdDevice.uuid = deviceWithUuid.uuids[0];
		      alert("This device is paired with a TMD.");
		  }
		  else{
		    alert("This device is NOT paired with a TMD.");
		  }
	        };

	        var onDiscoverUuidsError = function(msg){
		    alert("ERROR GETTING UUID msg=["+JSON.stringify(msg)+"]"); 
	        };
	    
   	        //tmdDevice.address = someData[0].address;
	        //get uuid

		var done=false;
		var btArrIdx = 0;

		tmdDevice.name = "";
		while (done === false){
		    if (btArrIdx >= someData.length){
			done = true;
		    }
		    else if (("name" in someData[btArrIdx]) && ("address" in someData[btArrIdx])){
			console.log("MobileMockUp onDeviceReady onSuccess() bluetooth device name=("+someData[btArrIdx].name+")");
			if (someData[btArrIdx].name.lastIndexOf("PAR-TMD200", 0) === 0){	
			    tmdDevice.name = someData[btArrIdx].name;
			    tmdDevice.address =  someData[btArrIdx].address;
			    done = true;
		        }
			else{
			    btArrIdx = btArrIdx + 1;
			}
		    }
		    else{
			btArrIdx = btArrIdx + 1;
		    }
		}
		
		if (tmdDevice.name.trim() !== ""){
	            window.bluetooth.getUuids(onDiscoveredUuids, onDiscoverUuidsError, tmdDevice.address);		
                }
		else{
		    alert("No paired TMD.");
		}
	    }
	    else{
		alert ("No paired devices.");
	    }
	};

	var onError = function(){
	    alert("No paired TMD.");
	};
	
	window.bluetooth.getPaired(onSuccess, onError);

	//this isn't being used.  we are doing device discover OUTSIDE this app.
	//$('#discoverDeviceButton').click(function(){
	//    app.discoverDevice();
        //});

        $('#startButton').click(function(){

	    userObject = app.getUserData(); 
	    if (("assignedUser" in userObject) &&
		("password" in userObject) &&
		("server" in userObject) &&
		("port" in userObject)){
                  //post: function(postEndPt, postServer, postPassword, postPort, parms){

		  var startButtonPostParms = new Object();
		  startButtonPostParms.userName = userObject.assignedUser;
		  app.post(endPoints[0], userObject.server, userObject.password, userObject.port, startButtonPostParms, app.displayDept);
	    }
	  });


	$('#mainPageHeaderId').bind( "tap", function(){
	    if (('name' in tmdDevice) && ('address' in tmdDevice) && ('uuid' in tmdDevice)){
		alert("name: "+tmdDevice.name+"\n\naddress: "+tmdDevice.address+"\n\nuuid: "+tmdDevice.uuid);
	    }
	    else{
	        alert("No paired TMD!  Cannot receive temperatures via bluetooth");
	    }
	});

	$(document).on('pageshow', '#nonTempTask', function(){
	    //$('input[name="radio-choice"]').prop('checked', false);
	    $('input[name="radio-choice"]').removeAttr("checked");
	});

	$(window).on('orientationchange', function(e) {
//	    alert("orientation changed");
//	    userObject.assignedUser
//	    userObject.password
//	    userObject.server
//	    userObject.port
//	    userObject.dept
//          userObject.checklist
//
//	    if (('dept' in userObject) && ('checklist' in userObject)){
//	         var redrawParms = new Object();
//	         redrawParms.userName = userObject.assignedUser;
//	         redrawParms.dept = userObject.dept;
//	         redrawParms.checklist = userObject.checklist;
//		 app.post(endPoints[2], userObject.server, userObject.password, userObject.port, redrawParms, app.displayChecks);
//	    }
         });

    },
    displayDept:  function(list){
	app.displayList("Departments", list, app.deptOkCallback);
    },
    deptOkCallback: function(selectedDept){
	//alert("You clicked on "+selectedDept);
	var deptOkButtonPostParms = new Object();
        deptOkButtonPostParms.userName = userObject.assignedUser;
	deptOkButtonPostParms.dept = selectedDept;
	userObject.dept = selectedDept;
        app.post(endPoints[1], userObject.server, userObject.password, userObject.port, deptOkButtonPostParms, app.displayChecklists);
    },
    displayChecklists:  function(listOfChecklists){
	app.displayList(userObject.dept, listOfChecklists, app.checklistOkCallback);
    },
    checklistOkCallback: function(selectedChecklist){
	//alert("You clicked " + selectedChecklist);
	var checklistOkButtonPostParms = new Object();
	checklistOkButtonPostParms.userName = userObject.assignedUser;
	checklistOkButtonPostParms.dept = userObject.dept;
	checklistOkButtonPostParms.checklist = selectedChecklist;
	userObject.checklist = selectedChecklist;
        app.post(endPoints[2], userObject.server, userObject.password, userObject.port, checklistOkButtonPostParms, app.displayChecks);	
    },
    displayChecks: function(listOfChecks){
	//app.displayListOfChecks(userObject.checklist, listOfChecks, app.checkOkCallback);
	app.displayListOfChecks(userObject.checklist, listOfChecks, app.tempTask, app.nonTempTask);
    },
    checkOkCallback: function(selectedCheck){
	userObject.check = selectedCheck;
	alert("selected check ="+selectedCheck);
    },
    displayListOfChecks: function(headerTitle, list, tempTaskCallback, nonTempTaskCallback){

	var newLink, htmlListString = "";
	
	$.mobile.changePage("#index", { transition: 'slide' });
	$('#headerText').text(headerTitle);

        $('#taskListUL').empty();

        for (var i = 0; i < list.length; i++){
	    
		//working

	        //listElements[0] = Milk:2075:T
	    var listElements = list[i].split(":");

 	    if (listElements[2] === "Q"){
		newLink="<li data-parm1=\"" + listElements + "\" class=\"styledliwithborder\" ><p style=\"white-space: normal !important;margin-left:20px;margin-top:20px;margin-bottom:20px;\" ><img class=\"questionMarkImg\" src=\"img/questionmark2.png\" height=\"40\" width=\"40\" ></img><span class=\"checkName\">" + listElements[0] + " </span></p></li>";
	    }
	    else{
		newLink="<li data-parm1=\"" + listElements + "\" class=\"styledliwithborder\" ><p style=\"white-space: normal !important;margin-left:20px;margin-top:20px;margin-bottom:20px;\" ><img class=\"clipboardImg\" src=\"img/taskGrayBackgroundg.png\" height=\"40\" width=\"40\" ></img><span class=\"checkName\">" + listElements[0] + " </span></p></li>";
	    }
	    
	    console.log("MobileMockUp displayData() adding ["+newLink+"]");	    
	    htmlListString=htmlListString+newLink;

	}


	$( '#taskListUL li' ).off( 'click' );


	$('#taskListUL').append(htmlListString);

	$('#taskListUL li').on('click', function(e) {

	    var myData = $(this).data("parm1").split(",");

	    if (myData[2] === "T"){
		    tempTaskCallback(myData[1], myData[0]);
	    }
            else if (myData[2] === "Q"){
		    nonTempTaskCallback(myData[1], myData[0]);
	    }
	    


        });
	
        $('[data-role="content"]').trigger('create');
        $(".example-wrapper").iscrollview("refresh");	
    },
    displayList: function(headerTitle, list, okCallback){

	var newLink, htmlListString = "";
	
	$.mobile.changePage("#index", { transition: 'slide' });
	$('#headerText').text(headerTitle);

        $('#taskListUL').empty();

        for (var i = 0; i < list.length; i++){
	    
	    newLink = "<li data-parm1=\"" + list[i] + "\" class=\"styledliwithborder\" id=\"id" + i + "\" ><p style=\"white-space: normal !important;margin-left:20px;margin-top:20px;margin-bottom:20px;\"><span class=\"checkNameWithPadding\">" + list[i] + "</span></p></li>";

	    
	    console.log("MobileMockUp displayData() adding ["+newLink+"]");	    
	    htmlListString=htmlListString+newLink;

	}


	$( '#taskListUL li' ).off( 'click' );


	$('#taskListUL').append(htmlListString);

	$('#taskListUL li').on('click', function(e) {

		var myData = $(this).data("parm1");
	        okCallback(myData);

        });


	
        $('[data-role="content"]').trigger('create');
        $(".example-wrapper").iscrollview("refresh");	
    },
    post: function(postEndPt, postServer, postPassword, postPort, parms, displayDataCallback){

	console.log("MobileMockUp post() START postEndPt="+postEndPt+" postServer="+postServer+" postPassword="+postPassword+" parms="+parms);
	var serverName = postServer + ":" + postPort;
	var encoded = Base64().encode(parms.userName + ':' + postPassword);
	var authType =  'Basic ' + encoded;
	
	var option = postEndPt+"?action=start&params=" + JSON.stringify(parms);
	var URL = serverName + "/rest/bpm/wle/v1/service/"+option;	

	console.log("MobileMockUp post() URL="+URL);
	
	$.ajax({
        url: URL,
        type: "POST",
        crossDomain: true,
        jsonp: "callback",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", authType);
        },
        success: function (result) {
            console.log("MobileMockUp post() success result="+JSON.stringify(result));

	    if (result.status === "200"){
	      //setTemp returns MobileMockUp post() success result={"status":"200","data":{"serviceStatus":"end","key":"@1003","step":"End","data":{"returnValue":"\"Re-temp product with Probe\",\"ruleExecuted\"","checks":null},"actions":null}}

	      if ("returnValue" in result.data.data){
		//display return value
		//on OK show new list of checks OR show Checklists screen
		if (postEndPt === "SPX@setData"){
		  displayDataCallback(result.data.data.returnValue, result.data.data.checks);
		}
		else if (postEndPt === "SPX@setTemp"){
		  displayDataCallback(parms.temp, result.data.data.returnValue, result.data.data.checks);
                }
	      }
	      else if ("depts" in result.data.data){
		displayDataCallback(result.data.data.depts.items);
	      }
	      else if ("checklists" in result.data.data){
		displayDataCallback(result.data.data.checklists.items);
	      }
	      else if ("checks" in result.data.data){	
		displayDataCallback(result.data.data.checks.items);
	      }
	    }
	    else{
		alert("Problem communicating with server.\n\nStatus: "+result.status);
	    }
        },
        error: function(jqXHR, textStatus, errorThrown) {
	    
            alert('Problem retrieving data');

            console.log('MobileMockUp post() ajax error jqXHR=['+JSON.stringify(jqXHR)+']');
            console.log('MobileMockUp post() ajax error textStatus=['+textStatus+']');
            console.log('MobileMockUp post() ajax error errorThrown=['+errorThrown+']');

	    
            },
        });

    },
    getUserData: function(){

	var userData = new Object();
	
	/*var user = $('#assignedUser').val();
	var pass = $('#pass').val();
	var server = $('#server').val();
	var port = $('#port').val();
	
	if (user.trim() == ""){
	    alert("Please enter a user name");
	}
	else if (pass.trim() == ""){
	    alert("Password cannot be blank");
	}
	else if (server.trim() == ""){
	    alert("Please enter a server name");
	}
	else if (port.trim() == ""){
	    alert("Please enter a port number");
	    var regex=/^[0-9]+$/;
            if (port.match(regex)){
                alert("Port number cannot contain any letters");
            }
	}
	else{
	    userData.assignedUser = user;
	    userData.password = pass;
	    userData.server = server;
	    userData.port = port;
	    }*/

	var user = $('#assignedUser').val();
	var pass = "passw0rd";
	var server = "http://bpm.capbpm.com";
	var port = "9080";
	
        if (user.trim() == ""){
	    alert("Please enter a user name");
	}	
	else{
	    userData.assignedUser = user;
	    userData.password = pass;
	    userData.server = server;
	    userData.port = port;
	}
	
	return userData;
	
    },    
    tempTask: function(someId, someText){

	console.log("MobileMockUp tempTask() START someId="+someId+" someText="+someText);

	if (!('address' in tmdDevice) || !('uuid' in tmdDevice)){
	    if (confirm('Put TMD in discoverable mode and hit OK')) {
               app.discoverDevice();
            } 
	}
	else{


	    $.mobile.changePage("#tempTask", { 
	   	                 transition: 'slide' });

	    $('#tempTaskNameH1').text(someText);
	    $('#tmdTemp').text("");
	    $('#manualTempInput').val("");
	    
            $('#sendTempOkButton').hide();
	    
	    //dissociate click
	    $( '#readTempFromTmdButton' ).off( 'click' );
	    
	    $('#readTempFromTmdButton').bind('click', function(e) {

		app.readTempFromTMD(someId);
		
	        //TO DO do i need this any more?
                e.stopImmediatePropagation(); 
	    });

	    $( '#sendTempManuallyButton' ).off( 'click' );
	    
	    $('#sendTempManuallyButton').bind('click', function(e) {

		var manuallyEnteredTemp = $('#manualTempInput').val();

		//alert("You Hit Click To Send Temp manuallyEnteredTemp="+manuallyEnteredTemp);
		
		if (manuallyEnteredTemp.trim() != ""){
		    
		    var postTempParms = new Object();
		    postTempParms.taskId = someId;
		    postTempParms.temp = manuallyEnteredTemp;
		    app.post(endPoints[3], userObject.server, userObject.password, userObject.port, postTempParms, app.afterPostingTempHandler);
		    
		}
		
	        //TO DO do i need this any more?
                e.stopImmediatePropagation(); 
	    });	    

	}

	
    },
    afterPostingTempHandler: function(postedTemp, retValue, listOfChecks){
	
		    $('#tmdTemp').text("The following temp:  " + postedTemp + " was sent successfully");

		    $('#sendTempOkButton').show();
		    $('#sendTempOkButton').off( 'click' );
		    $('#sendTempOkButton').on('click', function(e) {

			
			if ((retValue != null) && (retValue.trim() !== "")){
			    $.mobile.changePage("#correctiveAction", { transition: 'slide' });
			    $( '#returnValueText').text(retValue);
			    $( '#correctiveActionOkButton' ).off( 'click' );
			    $('#correctiveActionOkButton').on('click', function(e) {

			       /*
                                     if result.data.data.checks is null then do getCheckLists
                                     else display result.data.data.checks as the output of getChecks
                               */
				 delete userObject.check;
				
		                 $.mobile.changePage("#index", { transition: 'slide' });

				 //THIS IS FOR TESTING ONLY
				/*if (listOfChecks == null){
				    result={"status":"200","data":{"serviceStatus":"end","key":"@740","step":"End","data":{"checks":{"selected":[],"items":["Sour Cream:2096:T","Chorizo:2094:T","Yogurt:2092:T","Milk:2091:T","Sour Cream:2081:T","Chorizo:2078:T","Yogurt:2076:T","Milk:2075:T","No Product Available:2072:T","Soft Cheese:2070:T","Cottage Cheese:2067:T","Cookie Dough:2066:T","Sour Cream:2065:T","Chorizo:2062:T","Yogurt:2060:T","Milk:2059:T","No Product Available:2056:T","Soft Cheese:2055:T","Cottage Cheese:2052:T","Cookie Dough:2051:T","Sour Cream:2048:T","Chorizo:2046:T","Yogurt:2044:T","Milk:2043:T","No Product Available:2039:T","Soft Cheese:2036:T","Cottage Cheese:2034:T","Cookie Dough:2033:T","Sour Cream:2032:T","Yogurt:2028:T","Milk:2027:T"],"@metadata":{"objectID":"a710e2ea-9f96-4e8e-83eb-5b934fa0f342","dirty":true,"shared":false}}},"actions":null}}

				    listOfChecks = ["A Check:2096:T","Another Check:2094:T","This Is Not A Check It Is A Bill:2092:T" ];
				}*/
				if (listOfChecks != null){
				     //parmArr[0] = "SPX@getChecks";
				     //parmArr[1] = parmArr[4];
		                     //app.displayData(parmArr, listOfChecks);
				     app.displayChecks(listOfChecks);
				}
				else{
				    //var newParmArr = new Array();
				    //newParmArr[0]="SPX@getCheckLists";
				    //newParmArr[1]="Check Lists";
				    //newParmArr[2]=parmArr[2];
				    //newParmArr[3]=parmArr[3];
				    //app.getData(newParmArr);
				    
		                    delete userObject.checklist;
				    var getChecklistParmObj = new Object();
                                    getChecklistParmObj.userName = userObject.assignedUser;
	                            getChecklistParmObj.dept = userObject.dept;
		                    app.post(endPoints[1], userObject.server, userObject.password, userObject.port, getChecklistParmObj, app.displayChecklists);
				 }
                            });
			}
			else{
				if (listOfChecks != null){
				     //parmArr[0] = "SPX@getChecks";
				     //parmArr[1] = parmArr[4];
		                     //app.displayData(parmArr, listOfChecks);
				     app.displayChecks(listOfChecks);
				}
				else{
				    //var newParmArr = new Array();
				    //newParmArr[0]="SPX@getCheckLists";
				    //newParmArr[1]="Check Lists";
				    //newParmArr[2]=parmArr[2];
				    //newParmArr[3]=parmArr[3];
				    //app.getData(newParmArr);
				    
		                    delete userObject.checklist;
				    var getChecklistParmObj = new Object();
                                    getChecklistParmObj.userName = userObject.assignedUser;
	                            getChecklistParmObj.dept = userObject.dept;
		                    app.post(endPoints[1], userObject.server, userObject.password, userObject.port, getChecklistParmObj, app.displayChecklists);
				 }
			}
                    });		
    },
    afterPostingNonTempHandler: function(retValue, listOfChecks){
			if ((retValue != null) && (retValue.trim() !== "")){
			    $.mobile.changePage("#correctiveAction", { transition: 'slide' });
			    $( '#returnValueText').text(retValue);
			    $( '#correctiveActionOkButton' ).off( 'click' );
			    $('#correctiveActionOkButton').on('click', function(e) {

			       /*
                                     if result.data.data.checks is null then do getCheckLists
                                     else display result.data.data.checks as the output of getChecks
                               */
				 delete userObject.check;
				
		                 $.mobile.changePage("#index", { transition: 'slide' });


				if (listOfChecks != null){
				     app.displayChecks(listOfChecks);
				}
				else{
		                    delete userObject.checklist;
				    var getChecklistParmObj = new Object();
                                    getChecklistParmObj.userName = userObject.assignedUser;
	                            getChecklistParmObj.dept = userObject.dept;
		                    app.post(endPoints[1], userObject.server, userObject.password, userObject.port, getChecklistParmObj, app.displayChecklists);
				 }
                            });
			}
			else{
				if (listOfChecks != null){
				     app.displayChecks(listOfChecks);
				}
				else{
		                    delete userObject.checklist;
				    var getChecklistParmObj = new Object();
                                    getChecklistParmObj.userName = userObject.assignedUser;
	                            getChecklistParmObj.dept = userObject.dept;
		                    app.post(endPoints[1], userObject.server, userObject.password, userObject.port, getChecklistParmObj, app.displayChecklists);
				 }
			}

        /*delete userObject.check;
				
        $.mobile.changePage("#index", { transition: 'slide' });

	if (listOfChecks != null){
	    app.displayChecks(listOfChecks);
	}
	else{			    
            delete userObject.checklist;
	    var getChecklistParmObj = new Object();
            getChecklistParmObj.userName = userObject.assignedUser;
	    getChecklistParmObj.dept = userObject.dept;
	    app.post(endPoints[1], userObject.server, userObject.password, userObject.port, getChecklistParmObj, app.displayChecklists);
        }*/
	
    },    
    nonTempTask: function(someId, someText){
        $.mobile.changePage("#nonTempTask", { 
		transition: 'slide' });


	console.log("MobileMockUp nonTempTask someText="+someText);
	$("#questionText").text("");
	$("#questionText").text(someText);
	
	$("input[type='radio']").off("change");
	
	$("input[type='radio']").bind( "change", function(event, ui) {
            //alert("you clicked: "+$("#custom-fieldset :radio:checked").val()+" someId="+someId+" someText="+someText);
	    var setValParmsObj = new Object();
	    setValParmsObj.taskId = someId;
	    if ($("#custom-fieldset :radio:checked").val() === "yes"){
		setValParmsObj.val = "true";
	    }
	    else{
		setValParmsObj.val = "false";
	    }
	    //need to call post SPX@setData taskId, true/false (based on yes, no)
            app.post(endPoints[4], userObject.server, userObject.password, userObject.port, setValParmsObj, app.afterPostingNonTempHandler);
        });


    },
/*
    //this discovers a TMD.  
    //AFAIK it had been tested and was working.
    //i removed it because associating the device with a TMD makes more sense to do at the device level via Settings instead of in the app.

    discoverDevice: function(){
	console.log("MobileMockUp pairWithDevice() START");
	var onDeviceDiscovered = function(discoveredDevice){

	    var onDeviceDiscoveredGotUuids = function(deviceWithUuid){
	      console.log("MobileMockUp onDeviceDiscovered() onDeviceDiscoveredGotUuids=["+JSON.stringify(deviceWithUuid)+"]");
		if (('uuids' in deviceWithUuid) && (deviceWithUuid.uuids.length > 0) && (deviceWithUuid.uuids[0].trim() != "")){	
	            tmdDevice.uuid = deviceWithUuid.uuids[0];
	            //$('#deviceNameTextArea').val("address: "+tmdDevice.address+" uuid: "+tmdDevice.uuid);
		    //alert("Discovery Complete!");
		}
		else{
		    alert("Unable to detect device");
		}
	    };

	    var onDeviceDiscoveredOnError = function(msg){
		console.log("MobileMockUp onDeviceDiscoveredOnError msg=["+JSON.stringify(msg)+"]"); 
	    };
	    
	    console.log("MobileMockUp onDeviceDiscovered discoveredDevice=["+JSON.stringify(discoveredDevice)+"]");
	    if (discoveredDevice.address.trim() != ""){
		tmdDevice.address = discoveredDevice.address;
	        //get uuid
	        window.bluetooth.getUuids(onDeviceDiscoveredGotUuids, onDeviceDiscoveredOnError, tmdDevice.address);		
	    }
	    else{
		alert("Device Discover Failed");
	    }
	
	};
	
	var onDiscoveryFinished = function(){
	};
	window.bluetooth.startDiscovery(onDeviceDiscovered, onDiscoveryFinished, onDiscoveryFinished);
    },
*/
    readTempFromTMD: function(taskId){
	console.log("MobileMockUp readTempFromTMD() START taskId=("+taskId+")");
	
        if (confirm("Press Measure on TMD.\n\nTouch OK when TMD beeps once.")){

	//alert ("Take Temperature");
	
    	    var onConnectionEstablished = function(){

	        console.log("MobileMockup tempTask() onConnectionEstablished START");

	        var stopConnectionManagerSuccess = function(){
		    console.log("MobileMockUp tempTask() stopConnectionManager succeeded");
	        };

	        var stopConnectionManagerFail = function(){
		    console.log("MobileMockUp tempTask() stopConnectionManager failed");
	        };

	        var disconnectSuccess = function(){
		    console.log("MobileMockUp tempTask() disconnect succeeded");
	        };

	        var disconnectFail = function(){
		    console.log("MobileMockUp tempTask() disconnect failed");
	        };
		
	        var onMessageReceived = function(msg){

		    //msg contains temp like "c:22.1 f:71.7"
		    
		    var ctempFtemp = msg.split(" ");
		    var tempParms = new Object();
		    tempParms.taskId = taskId;
		    //ctempFtemp[0].substring(ctempFtemp[0].indexOf(":")+1);  //need everything after c:
		    tempParms.temp = ctempFtemp[1].substring(ctempFtemp[1].indexOf(":")+1);  //need everything after f:     may also need to drop decimal pt
		    
		    app.post(endPoints[3], userObject.server, userObject.password, userObject.port, tempParms, app.afterPostingTempHandler);
		    
		    window.bluetooth.stopConnectionManager(stopConnectionManagerSuccess, stopConnectionManagerFail);
		    
		    console.log("MobileMockUp readTempFromTMD() calling window.bluetooth.disconnect()");
                    window.bluetooth.disconnect(disconnectSuccess, disconnectFail);
	        };

	        var onConnectionLost = function(){
		    //alert("CONNECTION LOST");
		    window.bluetooth.stopConnectionManager(stopConnectionManagerSuccess, stopConnectionManagerFail);
		    console.log("MobileMockUp readTempFromTMD() calling window.bluetooth.disconnect()");
                    window.bluetooth.disconnect(disconnectSuccess, disconnectFail);		    
	        };

		
	        console.log("MobileMockUp readTempFromTMD() calling window.bluetooth.startConnectionManager()");
		if (confirm("When a circle appears around the TMD bluetooth icon press Measure again.\n\nWhen the TMD beeps, touch OK on this dialog.")){
	            window.bluetooth.startConnectionManager(onMessageReceived, onConnectionLost);
		}
		else{
                    window.bluetooth.disconnect(disconnectSuccess, disconnectFail);		    
		}
	    };
	
	    var onError = function(msg){
	      var message="Unable to connect to TMD.\n\nPlease try again\n\n";
	      console.log("MobileMockUp readTempFromTMD() onError msg.code="+msg.code+ " msg.message="+msg.message);
	      if ('message' in msg){
	          message = message+msg.message+"\n\n";	    
	      }
		
	      if ('code' in msg){
	          message = message+"Error code: "+msg.code;	    
	      }

	      alert(message);
		
	    };

	    console.log("MobileMockUp readTempFromTMD() calling window.bluetooth.connect()");
	    window.bluetooth.connect(onConnectionEstablished, onError, { address: tmdDevice.address,uuid: tmdDevice.uuid});
	}
	
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

app.initialize();
