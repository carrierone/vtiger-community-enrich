function login(d,c){var a=jQuery.Deferred();var b=localStorage.getItem("crm-url");$.ajax({type:"POST",url:b+"/modules/Gadget/api.php",data:{_operation:"login",username:d,password:c},success:function(e){a.resolve(e)}});return a.promise()}function resolveUrl(c,b){var a=jQuery.Deferred();$.ajax({type:"POST",url:"https://crmaccounts.od1.vtiger.com/v1/Users/Auth",data:{username:c,password:b},success:function(d){a.resolve(d)}});return a.promise()}function describe(c){var a=jQuery.Deferred();var b=c+"_describe";chrome.storage.local.get(b,function(e){if(e[b]){a.resolve(e[b])}else{var d=localStorage.getItem("crm-url");var f=localStorage.getItem("session");$.ajax({type:"POST",url:d+"/modules/Gadget/api.php",data:{_operation:"describe",_session:f,module:c},success:function(g){var h={};h[b]=g;chrome.storage.local.set(h,function(){});a.resolve(g)}})}});return a.promise()}function fetchRecordFromUrl(b){var a=jQuery.Deferred();var c=localStorage.getItem("crm-url");var e=localStorage.getItem("session");var d=localStorage.getItem("record-"+b);if(d&&d.length>1){a.resolve(JSON.parse(d))}else{$.ajax({type:"POST",url:c+"/modules/Gadget/api.php",data:{_operation:"fetchRecordFromLinkedinUrl",_session:e,url:b,allrecords:true},success:function(f){if(f.success){localStorage.setItem("record-"+b,JSON.stringify(f))}a.resolve(f)}})}return a.promise()}function fetchRecordFromEmail(c){var a=jQuery.Deferred();var b=localStorage.getItem("crm-url");var e=localStorage.getItem("session");var d=localStorage.getItem("record-"+c);if(d&&d.length>1){a.resolve(JSON.parse(d))}else{$.ajax({type:"POST",url:b+"/modules/Gadget/api.php",data:{_operation:"fetchRecordDetailsFromEmail",_session:e,email:c,allrecords:true},success:function(f){if(f.success){localStorage.setItem("record-"+c,JSON.stringify(f))}a.resolve(f)}})}return a.promise()}function fetchRecordFromName(g,d,c){var a=jQuery.Deferred();var b=localStorage.getItem("crm-url");var f=localStorage.getItem("session");var e=localStorage.getItem("record-"+g+"-"+d);if(e&&e.length>1){a.resolve(JSON.parse(e))}else{$.ajax({type:"POST",url:b+"/modules/Gadget/api.php",data:{_operation:"fetchRecordDetailsFromNameDetails",_session:f,firstname:g,lastname:d,accountname:c},success:function(h){if(h.success){localStorage.setItem("record-"+g+"-"+d,JSON.stringify(h))}a.resolve(h)}})}return a.promise()}function saveRecord(c,f,l,e){if(c=="Contacts"){var a=l.primary_linkedin;var j=l.email;var g=l.firstname;var i=l.lastname;localStorage.setItem("record-"+a,"");localStorage.setItem("record-"+j,"");localStorage.setItem("record-"+g+"-"+i,"")}localStorage.setItem("record-"+f,"");var h=jQuery.Deferred();var b=localStorage.getItem("crm-url");var k=localStorage.getItem("session");var d=new FormData();d.append("_operation","saveRecord");d.append("_session",k);d.append("module",c);d.append("record",f);d.append("values",l);if(e){d.append("imagename[]",e)}$.ajax({type:"POST",url:b+"/modules/Gadget/api.php",data:d,cache:false,contentType:false,enctype:"multipart/form-data",processData:false,success:function(m){h.resolve(m)}});return h.promise()}function fetchRefernceRecords(c,f){var a=jQuery.Deferred();var b=localStorage.getItem("crm-url");var e=localStorage.getItem("session");var d=localStorage.getItem("search-"+f);if(d&&d.length>1){a.resolve(JSON.parse(d))}else{$.ajax({type:"POST",url:b+"/modules/Gadget/api.php",data:{_operation:"fetchReferenceRecords",_session:e,referenceModule:c,searchKey:f},success:function(g){if(g.success){localStorage.setItem("search-"+f,JSON.stringify(g))}a.resolve(g)}})}return a.promise()}function fetchRecord(a){var b=jQuery.Deferred();var c=localStorage.getItem("crm-url");var e=localStorage.getItem("session");var d=localStorage.getItem("record-"+a);if(d&&d.length>1){b.resolve(JSON.parse(d))}else{$.ajax({type:"POST",url:c+"/modules/Gadget/api.php",data:{_operation:"fetchRecord",_session:e,record:a},success:function(f){if(f.success){localStorage.setItem("record-"+a,JSON.stringify(f))}b.resolve(f)}})}return b.promise()};