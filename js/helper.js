function isLocalTesting(){return false}function addBodyHeading(a){replaceElement(".bodyHeader",'<span class="headingStyle"><strong>'+a+"</strong></span>")}function replaceElement(a,b){jQuery(a).html(b)}function appendElement(a,b){jQuery(a).append(b)}function prependElement(a,b){jQuery(a).prepend(b)}function showErrorMessage(a,b){var c='<div class="alert alert-danger alert-dismissible" style="z-index: 10;">\n						<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>\n						'+b+"\n					</div>";jQuery(a).prepend(c);$(".alert-danger").fadeTo(1000,500).slideUp(500,function(){$(".alert-danger").alert("close")})}function showProgressBar(a){jQuery(a).append('<div id="progressBar"><div class="progressBackdrop"></div><div class="row"><div class="col-lg-12"><svg class="spinner"><circle cx="40" cy="40" r="16"></circle><circle class="small" cx="40" cy="40" r="10"></circle></div></div></div>')}function hideProgressBar(){jQuery("#progressBar").remove()}function getLocalStoargeValue(a){return localStorage.getItem(a)}function setLocalStoargeValue(a,b){localStorage.setItem(a,b)}function clearLocalStorage(){chrome.storage.local.set({userDetails:""},function(){});chrome.storage.local.clear();localStorage.clear()}function getExtractedContactInfo(){var a=getLocalStoargeValue("contactInfo");return a?JSON.parse(a):a}function setExtractedContactInfo(){chrome.storage.local.get("contactInfo",function(a){localStorage.setItem("contactInfo",JSON.stringify(a.contactInfo))})}function clearExtractedContactInfo(){chrome.storage.local.set({contactInfo:""},function(){});localStorage.setItem("contactInfo","")};