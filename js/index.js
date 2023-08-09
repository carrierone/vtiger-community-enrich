/*
 * Copyright (C) www.vtiger.com. All rights reserved.
 * Vtiger Commercial License 1.1. Reverse engineering restricted.
 * Author : Anand Jain
 */
function registerOpenInVtigerEvent() {
	jQuery('.openInVtiger').on('click',function(){
		var url = getLocalStoargeValue('crm-url');
		var recordId = jQuery(this).attr('data-recordid').split('x');
		var version = getLocalStoargeValue('vtiger_version');
		if(version.startsWith("7")) {
			window.open(url + '/index.php?module=Contacts&view=Detail&record=' + recordId[1], '_blank');		
		} else {
			window.open(url + '/view/detail?module=Contacts&id=' + recordId[1], '_blank');
		}
		
	});
}

function registerAddEvents() {
	var url = getLocalStoargeValue('crm-url');
	var version = getLocalStoargeValue('vtiger_version');
	jQuery('#addEvent').on('click',function(){
		var recordId = jQuery(this).attr('data-recordid').split('x');
		if(version.startsWith("7")) {
			window.open(url + '/index.php?module=Calendar&view=Edit&mode=Events&contact_id=' + recordId[1], '_blank');	
		} else {
			window.open(url + '/view/edit?module=Events&contact_id=' + recordId[1], '_blank');
		}
		
	});
	jQuery('#addTask').on('click',function(){
		var recordId = jQuery(this).attr('data-recordid').split('x');
		if(version.startsWith("7")) {
			window.open(url + '/index.php?module=Calendar&view=Edit&mode=Calendar&contact_id=' + recordId[1], '_blank');	
		} else {
			window.open(url + '/view/edit?module=Tasks&contact_id=' + recordId[1], '_blank');
		}
	});
}

function loadContactDetails(record, backAllowed, contactInfo) {
	record = $.makeArray(record)[0];
	showProgressBar('body');
	describe('Contacts').then(function (result) {
		hideProgressBar();
		if (result.success) {
			if(contactInfo)
				var parsedContactInfo = JSON.parse(unescape(contactInfo));
			var contactFields = result.result.describe.fields;

			var heading  = 'CRM Contact Details';
			addBodyHeading(heading);
			var records = getLocalStoargeValue('records');
			if (records) {
				prependElement('.bodyHeader', '<span class="backToList cursorPointer" data-contact="'+contactInfo+'"><i class="fa fa-angle-left "></i></span>&nbsp;&nbsp;');
				registerBackToListButton(records, backAllowed);
			}
			appendElement('.bodyHeader', '<span class="openInVtiger cursorPointer pull-right m-t-16" data-recordid="'+record['id']+'"><i class="fa fa-external-link"></i></span>');
			registerOpenInVtigerEvent();
			var requiredFields = ['firstname', 'lastname', 'title', 'description', 'mobile', 'email', 'otherstreet'];
			
			if(backAllowed) {
				var data = '<div class="alert alert-info updateActions">\n\
							<p>\n\
								<button data-record="'+contactInfo+'" data-crmrecord="'+escape(JSON.stringify(record))+'" class="updateRecord btn btn-sm btn-primary">Update below contact</button></p>\n\
						</div>';
			} else {
				var data = '<div class="alert alert-info updateActions">\n\
							<p>Contact Updated succesfully in Vtiger CRM.</p>\n\
							<p><button id="addEvent" data-recordid="'+record['id']+'" class="btn btn-sm btn-primary">Add Event</button>&nbsp;\n\
								<button id="addTask" data-recordid="'+record['id']+'" class="btn btn-sm btn-primary">Add Task</button></p>\n\
						</div>';
			}

			
			var table = data + '<table class="table"><tbody>';
			$.each(contactFields, function (index, value) {
				if ((value['mandatory'] || value['summaryfield'] || value['headerfield'] ||
						jQuery.inArray(value['name'], requiredFields) != -1)) {
					var displayValue = $.isPlainObject(record[value['name']]) ? record[value['name']].label : record[value['name']];
					table = table + '<tr><th scope="row">' + value['label'] + '</th><td class="breakWord">' + displayValue + '</td></tr>';
				}
			});
			table = table + '</tbody></table>';
			replaceElement('.bodyContainer', table);
			registerAddEvents();
			registerUpdateContact();
		}
	});
}

function loadOrgRecord(record) {
	$('#createAccount').modal('toggle');
	$('#createContactForm').find('[name="account_id"]').append('<option value=' + record.id + '>' + record.name + '<option>');
	$('#createContactForm').find("option[value=" + record.id + "]").attr("selected", "selected").trigger('change');
}

function createAccount(record) {
	$('#createAccountForm').submit(function (event) {
		showProgressBar('body');
		event.preventDefault();
		var values = $("#createAccountForm").serializeArray();
		var recordValues = {};
		$.each(values, function (index, value) {
			recordValues[value['name']] = value['value'];
		});
		recordValues = JSON.stringify(recordValues);
		saveRecord('Accounts', record, recordValues).then(function (result) {
			hideProgressBar();
			if (result.success) {
				fetchRecord(result.result.record.id).then(function (res) {
					var record = {
						name: res.result.record.accountname,
						id: res.result.record.id
					}
					loadOrgRecord(record);
				});
			} else {
				showErrorMessage('#createAccountForm', result.error.message);
			}
		});
	});
}

function createContact(record, backAllowed) {
	$('#createContactForm').submit(function (event) {
		event.preventDefault();
		var values = $("#createContactForm").serializeArray();
		var recordValues = {};
		$.each(values, function (index, value) {
			if (recordValues.hasOwnProperty(value['name'])) {
				if (!$.isArray(recordValues[value['name']])) {
					var valuesArray = [];
					valuesArray.push(recordValues[value['name']]);
					recordValues[value['name']] = valuesArray;
				}
				recordValues[value['name']].push(value['value']);
			} else {
				recordValues[value['name']] = value['value'];
			}
		});
		recordValues = JSON.stringify(recordValues);

		showProgressBar('body');
		saveRecord('Contacts', record, recordValues).then(function (result) {
			hideProgressBar();
			if (result.success) {
				fetchRecord(result.result.record.id).then(function (res) {
					var contactInfo = false;
					if(backAllowed) {
						contactInfo = getLocalStoargeValue('openedContactInfo');
					}
					loadContactDetails(res.result.record, backAllowed, contactInfo);
				});
			} else {
				showErrorMessage('#createContactForm', result.error.message);
			}
		});
	});
}

function getUserFieldElement(value, contactInfo) {
	var inputElement = '<select class="select2-picklist" name=' + value['name'] + ' style="width: 100%;" ';
	inputElement = value['mandatory'] ? inputElement + ' required >' : inputElement + '>';
	inputElement = inputElement + '<option value="">Select an option</option>';

	if (Object.keys(value['accessibleUsersAndGroups'].users).length) {
		inputElement = inputElement + '<optgroup label="Users"></optgroup>';
		$.each(value['accessibleUsersAndGroups'].users, function (key, picklistlabel) {
			inputElement = inputElement + '<option value="19x' + key + '" ';
			if (contactInfo[value['name']] && contactInfo[value['name']]['value'] == '19x' + key) {
				inputElement = inputElement + ' selected ';
			}
			inputElement = inputElement + '>' + picklistlabel + '</option>';
		});
	}

	if (Object.keys(value['accessibleUsersAndGroups'].groups).length) {
		inputElement = inputElement + '<optgroup label="Groups"></optgroup>';
		$.each(value['accessibleUsersAndGroups'].groups, function (key, picklistlabel) {
			inputElement = inputElement + '<option value="20x' + key + '" ';
			if (contactInfo[value['name']] && contactInfo[value['name']]['value'] == '20x' + key) {
				inputElement = inputElement + ' selected ';
			}
			inputElement = inputElement + '>' + picklistlabel + '</option>';
		});
	}

	inputElement = inputElement + '</select>';
	return inputElement;
}

function getCreateOrgForm(contactInfo) {
	var aDeferred = jQuery.Deferred();
	if(!contactInfo)
		contactInfo = getExtractedContactInfo();
	contactInfo['accountname'] = contactInfo['company'];
	contactInfo['email1'] = contactInfo['email'];
	showProgressBar('body');
	describe('Accounts').then(function (result) {
		hideProgressBar();
		var AccountResult = [];
		if(result.error) {
			AccountResult.modal = '';
			AccountResult.id = null;
			aDeferred.resolve(AccountResult);
		} else {
			var fields = result.result.describe.fields;
			var idPrefix = result.result.describe.idPrefix;
			
			var modalHeader = '<div class="modal fade" id="createAccount" role="dialog" aria-labelledby="createAccount" aria-hidden="true">\n\
									<div class="modal-dialog" role="document">\n\
										<div class="modal-content">\n\
											<div class="modal-header text-center">\n\
												<h4 class="modal-title w-100 font-weight-bold">Create New Organisation\n\
												<button type="button" class="close" data-dismiss="modal" aria-label="Close">\n\
													<span aria-hidden="true">&times;</span>\n\
												</button></h4>\n\
											</div>';

			var form = '<form id="createAccountForm" class="form-horizontal m-lr-8"><table class=formtable>';
			var sourceElement = '<input type=hidden name="source" value="' + contactInfo['source'] + '">';
			form = form + sourceElement;

			var userId = getLocalStoargeValue('userid');
			var userElement = '<input type=hidden name="assigned_user_id" value="' + userId + '">';
			form = form + userElement;

			var modalBody = modalHeader + form;

			$.each(fields, function (index, value) {
				var displayValue = $.isPlainObject(contactInfo[value['name']]) ? contactInfo[value['name']].label : contactInfo[value['name']];
				displayValue = displayValue === undefined || displayValue == ''? value['default'] : displayValue;

				if ((value['mandatory']) && value['name'] != 'assigned_user_id' && value['editable']) {
					var inputElement = '<input type="text" class=" fieldValue" id="' + value['name'] + '" name="' + value['name'] + '" value="' + displayValue + '" ';
					inputElement = value['mandatory'] ? inputElement + ' required >' : inputElement + '>';

					switch (value['name']) {
						case 'description' :
							inputElement = '<textarea class=" fieldValue" rows="5" id="' + value['name'] + '" name="' + value['name'] + '"';
							inputElement = value['mandatory'] ? inputElement + ' required >' : inputElement + '>';
							inputElement = inputElement + displayValue + '</textarea>';
							break;
					}

					if (value['type']['name'] == 'reference') {
						inputElement = '<span id=' + value['name'] + '><select class="referenceRecordField" data-module=' + value['type']['refersTo'] + ' name=' + value['name'] + ' style="width: 100%;"';
						inputElement = value['mandatory'] ? inputElement + ' required >' : inputElement + '>';
						inputElement = inputElement + '</select></span>';
					}

					if (value['type']['name'] == 'date') {
						inputElement = '<input class="fieldValue datepicker" type="text" name="' + value['name'] + '" data-existingvalue="'+displayValue+'">';
					}

					if (value['type']['name'] == 'time') {
						inputElement = '<input class="fieldValue timepicker" type="text" name="' + value['name'] + '" data-existingvalue="'+displayValue+'">';
					}

					if (value['type']['name'] == 'owner' && value['accessibleUsersAndGroups']) {
						inputElement = getUserFieldElement(value, contactInfo);
					}

					var element = '<tr class="moduleField"> <td class="p-16-imp">\n\
										<div class="fieldLabel">' + value['label'] + '</div> \n\
										<div class="existingValue"><div>' + inputElement + '</div></div>\n\
									</tr>';
						
					modalBody = modalBody + element;
				}
			});

			var modalFooter = modalBody;

			var submitButton = '<tr>\n\
									<td class="buttons">\n\
										<button type="submit" class="btn btn-primary pull-right">Save Organization</button>\n\
									</td>\n\
								</tr>';

			modalFooter = modalFooter + submitButton + '</table>';
			modalFooter = modalFooter + '</form></div></div></div>';
			AccountResult.modal = modalFooter;
			AccountResult.id = idPrefix + 'x0';
			aDeferred.resolve(AccountResult);	
		}
		
	});
	return aDeferred.promise();
}

//functiont to register search events for reference fields
function registerReferenceRecordsSearchEvent() {
	var url = getLocalStoargeValue('crm-url');
	var session = getLocalStoargeValue('session');
	var lastResults = [];

	$(".referenceRecordField").select2({
		ajax: {
			url: url + "/modules/Gadget/api.php",
			type: "post",
			dataType: 'json',
			delay: 250,
			data: function (params) {
				var data = {};
				data['_operation'] = 'fetchReferenceRecords';
				data['_session'] = session;
				data['searchKey'] = params.term;
				data['referenceModule'] = $(this).attr('data-module');
				return data;
			},
			processResults: function (data, params) {
				var results = data.result;
				var finalResults = [];
				$.each(results, function (index, value) {
					var resultData = [];
					resultData.id = value['value'];
					resultData.text = value['label'];
					finalResults.push(resultData);
				});
				lastResults.results = finalResults;
				return lastResults;
			},
			cache: true
		},
		placeholder: 'Type to search',
		minimumInputLength: 3,
	});

}

function generateContactForm(requiredFields, contactInfo) {
	var aDeferred = jQuery.Deferred();

	var form = '<form id="createContactForm" class="form-horizontal m-t-4"><table class=formtable>';
	var sourceElement = '<input type=hidden name="source" value="' + contactInfo['source'] + '">';
	form = form + sourceElement;

	var userId = getLocalStoargeValue('userid');
	var userElement = '<input type=hidden name="assigned_user_id" value="' + userId + '">';
	form = form + userElement;

	$.each(requiredFields, function (index, value) {
		var displayValue = $.isPlainObject(contactInfo[value['name']]) ? contactInfo[value['name']].label : contactInfo[value['name']];
		displayValue = displayValue === undefined || displayValue == ''? value['default'] : displayValue;

		var inputElement = '<input type="text" class=" fieldValue" id="' + value['name'] + '" name="' + value['name'] + '" value="' + displayValue + '"';
		inputElement = value['mandatory'] ? inputElement + ' required >' : inputElement + '>';
		switch (value['name']) {
			case 'linkedin_qualification':
			case 'linkedin_experience':
			case 'linkedin_skills':
			case 'description' :
				inputElement = '<textarea class=" fieldValue" rows="5" id="' + value['name'] + '" name="' + value['name'] + '"';
				inputElement = value['mandatory'] ? inputElement + ' required >' : inputElement + '>';
				inputElement = inputElement + displayValue + '</textarea>';
				break;
		}

		if (value['type']['name'] == 'reference') {
			inputElement = '<span id=' + value['name'] + '><select class="referenceRecordField" data-module=' + value['type']['refersTo'] + ' name=' + value['name'] + ' style="width: 100%; "';
			inputElement = value['mandatory'] ? inputElement + ' required >' : inputElement + '>';
			if (displayValue) {
				inputElement = inputElement + '<option value="' + contactInfo[value['name']].value + '">' + displayValue + '</option>';
			}
			inputElement = inputElement + '</select></span>';
		}
		if (value['name'] == 'account_id') {
			inputElement = inputElement + '<span id="orgFromContainer">\n\
												<span type="button" class="cursorPointer f-b" data-toggle="modal" data-target="#createAccount"><em>Create New Org</em></span>\n\
											</span>';
		}

		if (value['type']['name'] == 'picklist') {
			inputElement = '<select class="select2-picklist" name=' + value['name'] + ' style="width: 100%;" ';
			inputElement = value['mandatory'] ? inputElement + ' required >' : inputElement + '>';
			inputElement = inputElement + '<option value="">Select an option</option>';
			$.each(value['type']['picklistValues'], function (key, picklistVal) {
				inputElement = inputElement + '<option value="' + picklistVal.value + '" ';
				if(value['default'] == picklistVal.value) {
					inputElement = inputElement + ' selected ';
				}
				if (contactInfo[value['name']] == picklistVal.value) {
					inputElement = inputElement + ' selected ';
				}
				inputElement = inputElement + '>' + picklistVal.label + '</option>';
			});
			inputElement = inputElement + '</select>';
		}

		if (value['type']['name'] == 'multipicklist') {
			var multiSelectValues = contactInfo[value['name']] ? $.map(contactInfo[value['name']].split("|##|"), $.trim) : [];
			inputElement = '<select class="select2-picklist" name=' + value['name'] + ' style="width: 100%;" multiple';
			inputElement = value['mandatory'] ? inputElement + ' required >' : inputElement + '>';
			$.each(value['type']['picklistValues'], function (key, picklistVal) {
				inputElement = inputElement + '<option value="' + picklistVal.value + '" ';
				if (jQuery.inArray(picklistVal.value, multiSelectValues) != -1) {
					inputElement = inputElement + ' selected ';
				}
				inputElement = inputElement + '>' + picklistVal.label + '</option>';
			});
			inputElement = inputElement + '</select>';
		}

		if (value['type']['name'] == 'date') {
			inputElement = '<input class=" fieldValue datepicker" type="text" name="' + value['name'] + '" data-existingvalue="'+displayValue+'">';
		}

		if (value['type']['name'] == 'time') {
			inputElement = '<input class="fieldValue timepicker" type="text" name="' + value['name'] + '" data-existingvalue="'+displayValue+'">';
		}

		if (value['type']['name'] == 'owner' && value['accessibleUsersAndGroups']) {
			inputElement = getUserFieldElement(value, contactInfo);
		}

		var element = '<tr class="moduleField"> <td class="p-16-imp">\n\
							<div class="fieldLabel">' + value['label'] + '</div> \n\
							<div class="existingValue"><div>' + inputElement + '</div></td>\n\
						</tr>';
		form = form + element;
	});

	form = form + '<tr class="showHideContainer"><td>\n\
					<div id="showmoreFields" class="alignCenter cursorPointer">\n\
						Show more Fields &nbsp;<i class="fa fa-angle-down"></i>\n\
					</div></tr>';
	form = form + '<tr class="showHideContainer"><td>\n\
					<div id="showlessFields" class="alignCenter cursorPointer hide">\n\
						Show less Fields &nbsp;<i class="fa fa-angle-up"></i>\n\
					</div></tr>';

	var submitButton1 = '<tr>\n\
							<td class="buttons">\n\
								<button type="submit" class="saveContactButton btn btn-sm btn-primary pull-right">Save</button>\n\
							</td>\n\
						</tr>';
		
	var submitButton2 = '<tr>\n\
							<td class="buttons">\n\
								<button type="submit" class="saveContactButton2 btn btn-lg btn-block btn-primary">Save</button>\n\
							</td>\n\
						</tr>';

	form = form + submitButton1 + submitButton2 ;
	form = form + '</table></form>';

	showProgressBar('body');
	getCreateOrgForm(contactInfo).then(function (AccountResult) {
		hideProgressBar();

		form = form + AccountResult.modal;
		$('.bodyContainer').html(form);
		jQuery('.select2-picklist').select2({});
		aDeferred.resolve(AccountResult.id);
	});
	return aDeferred.promise();
}

function getRequieredFields(fields, contactInfo) {
	if(!contactInfo) {
		contactInfo = getLocalStoargeValue('openedContactInfo');
		if(!contactInfo) {
			contactInfo = getExtractedContactInfo();
		} else {
			contactInfo = JSON.parse(unescape(contactInfo));
		}
	}
	
	var requiredFields = [];
	var levelOneFields = [];
	var otherFields = ['firstname', 'lastname', 'description','title', 'mobile', 'email', 'mailingstreet', 'mailingcity', 'mailingcountry', 'mailingstate',
		'source', 'account_id'];

	switch (contactInfo['sourceDomain']) {
		case 'Linkedin' :
			otherFields.push('primary_linkedin');
			otherFields.push('followers_linkedin');
			otherFields.push('linkedin_experience');
			otherFields.push('linkedin_qualification');
			otherFields.push('linkedin_skills');
			break;

		case 'Facebook' :
			otherFields.push('primary_facebook');
			otherFields.push('followers_facebook');
			break;
	}

	$.each(fields, function (index, value) {
		if ((value['mandatory'] || jQuery.inArray(value['name'], otherFields) != -1)
				&& value['name'] != 'assigned_user_id' && value['editable']) {
			requiredFields.push(value);
			levelOneFields.push(value['name']);
		}
	});

	setLocalStoargeValue('levelOneFields', JSON.stringify(levelOneFields));

	$.each(fields, function (index, value) {
		if ((value['summaryfield'] || value['headerfield']) && jQuery.inArray(value['name'], levelOneFields) == -1
				&& value['name'] != 'assigned_user_id' && value['editable']) {
			requiredFields.push(value);
		}
	});
	return requiredFields;
}

function registerShowMoreFieldsEvent(hiddenFields) {
	jQuery('#showmoreFields').on('click', function () {
		$.each(hiddenFields, function (index, value) {
			jQuery('[name="' + value + '"]').closest('tr').removeClass('hide');
		});
		jQuery(this).addClass('hide');
		jQuery('#showlessFields').removeClass('hide');
	});
}

function registerShowLessFieldsEvent(hiddenFields) {
	jQuery('#showlessFields').on('click', function () {
		$.each(hiddenFields, function (index, value) {
			jQuery('[name="' + value + '"]').closest('tr').addClass('hide');
		});
		jQuery(this).addClass('hide');
		jQuery('#showmoreFields').removeClass('hide');
	});
}

function registerDatePickerEvent() {
	jQuery(".datepicker").datepicker();
	jQuery(".timepicker").timepicker();


	var format = 'yy-mm-dd';
	// switch(getLocalStoargeValue('date_format')) {
	// 	case 'dd-mm-yyyy':
	// 		format = 'dd-mm-yy';
	// 	case 'mm-dd-yyyy':
	// 		format = 'mm-dd-yy';
	// }

	jQuery(".datepicker").datepicker( "option", "dateFormat", format );

	jQuery(".datepicker").each(function(index,ele){
		existingValue = jQuery(ele).attr('data-existingvalue');
		if(existingValue.length) {
			$(this).datepicker('setDate', existingValue);
		}
	});

	jQuery(".timepicker").each(function(index,ele){
		existingValue = jQuery(ele).attr('data-existingvalue');
		if(existingValue.length) {
			$(this).timepicker('setTime', existingValue);
		}
	});
	
}

function loadContactForm(contactInfo, formattingRequired) {
	var aDeferred = jQuery.Deferred();
	jQuery('.createNewContactContainer').addClass('hide');
	showProgressBar('body');
	describe('Contacts').then(function (result) {
		hideProgressBar();
		if (result.success) {
			var describeResult = result.result.describe;
			var requiredFields = getRequieredFields(describeResult.fields);
			if (formattingRequired) {
				var formattedContactInfo = formatContactInfo(contactInfo);
				formattedContactInfo['source'] = contactInfo['sourceDomain'];
				formattedContactInfo['accountname'] = contactInfo['company'];
				formattedContactInfo['id'] = describeResult.idPrefix + 'x0';
			} else {
				formattedContactInfo = contactInfo;
			}
			showProgressBar('body');
			generateContactForm(requiredFields, formattedContactInfo).then(function (accountId) {
				var levelOneFields = JSON.parse(getLocalStoargeValue('levelOneFields'));
				var hiddenFields = [];
				$.each(requiredFields, function (index, value) {
					if (jQuery.inArray(value['name'], levelOneFields) == -1) {
						jQuery('[name="' + value['name'] + '"]').closest('tr').addClass('hide');
						hiddenFields.push(value['name']);
					}
				});

				if (requiredFields.length <= levelOneFields.length) {
					jQuery('#showmoreFields').remove();
				} else {
					registerShowMoreFieldsEvent(hiddenFields);
					registerShowLessFieldsEvent(hiddenFields);
				}

				registerDatePickerEvent();

				hideProgressBar();
				result = {
					accountId: accountId,
					contactId: formattedContactInfo['id']
				}
				aDeferred.resolve(result);
			});
		}
	});
	return aDeferred.promise();
}

function getFormattedExperiences(experiences) {
	var string = '';
	$.each(experiences, function(index, experience) {
		for(var key in experience) {
			string += key+': '+experience[key];
			string +='\n';
		}
		string += '\n';
	})
	return string;
}

function getFormattedEducations(educations) {
	var string = '';
	$.each(educations, function(index, education) {
		for(var key in education) {
			string += key+': '+education[key];
			string +='\n';
		}
		string += '\n';
	})
	return string;
}

function getFormattedSkills(skills) {
	var string = '';
	$.each(skills, function(index, skill) {
		for(var key in skill) {
			string += key+': '+skill[key];
			string +='\n';
		}
		string += '\n';
	})
	return string;
}

function formatContactInfo(contactInfo) {
	var name = contactInfo['name']?contactInfo['name'].split(" "):'';
	var formattedContactInfo = {};
	formattedContactInfo['firstname'] = name[0];
	formattedContactInfo['lastname'] = name[1];
	formattedContactInfo['description'] = contactInfo['description'];
	//title is changed to picklist field - TODO
	formattedContactInfo['title'] = contactInfo['title'];
	formattedContactInfo['mobile'] = contactInfo['phone'];
	formattedContactInfo['email'] = contactInfo['email'];
	formattedContactInfo['otherstreet'] = contactInfo['address'];

	switch (contactInfo['sourceDomain']) {
		case 'Linkedin' :
			formattedContactInfo['primary_linkedin'] = contactInfo['profileLink'];
			formattedContactInfo['followers_linkedin'] = contactInfo['followers'];
			formattedContactInfo['linkedin_experience'] = getFormattedExperiences(contactInfo['experiences']);
			formattedContactInfo['linkedin_qualification'] = getFormattedEducations(contactInfo['educations']);
			formattedContactInfo['linkedin_skills'] = getFormattedSkills(contactInfo['skills']);
			break;
		case 'Facebook' :
			formattedContactInfo['primary_facebook'] = contactInfo['profileLink'];
			formattedContactInfo['followers_facebook'] = contactInfo['followers'];
			break;
	}

	var address = contactInfo['address']? contactInfo['address'].split(","): '';
	if (address.length) {
		var country = address[address.length - 1];
		formattedContactInfo['mailingcountry'] = country;
		if (address.length == 3) {
			formattedContactInfo['mailingcity'] = address[0];
			formattedContactInfo['mailingstate'] = address[1];
		} else if (address.length == 2) {
			formattedContactInfo['mailingstreet'] = address[0];
		}
	}
	return formattedContactInfo;
}

function registerUpdateEvent(contactInfo) {
	var formattedContactInfo = formatContactInfo(contactInfo);
	$.each(formattedContactInfo, function (index, value) {
		if($.trim(value) && $.trim(jQuery('[name="' + index + '"]').val()) != $.trim(value)) {
			jQuery('[name="' + index + '"]').closest('tr').find('.existingValue')
				.append('<div class="updateContainer"><span class="updateElement cursorPointer f-b">Update</span>\n\
								<span> with </span> <span class="textOverFlowEllipsis"><strong>' + value + '</strong></span></div>');
			jQuery('[name="' + index + '"]').closest('tr').find('.fieldLabel')
				.append('<span class="matchError"><i class="fa fa-exclamation-circle p-lr-4 f-r"></i></span>')
		}

		if($.trim(value) && $.trim(jQuery('[name="' + index + '"]').val()) == $.trim(value)) {
			jQuery('[name="' + index + '"]').closest('tr').find('.existingValue')
				.append('<div class="updateContainer"><span>'+jQuery('[name="' + index + '"]').closest('tr').find('.fieldLabel').text()+' \n\
							<strong> matched</strong></span></div>');
		}
	});

	jQuery('.updateElement').on('click', function () {
		var updateElement = jQuery(this).closest('tr').find('.fieldValue');
		var updateKey = jQuery(updateElement).attr('name');
		var existingValue = jQuery(updateElement).val();
		jQuery(updateElement).val(formattedContactInfo[updateKey]);

		jQuery(this).closest('tr').find('.updateContainer')
				.append('<span class="undoElement cursorPointer f-b" data-value="' + existingValue + '" title="revert">&nbsp;<i class="fa fa-undo bold"></i></span>');
		jQuery(this).addClass('hide');
		existingValue = existingValue ? existingValue : 'blank';
		jQuery(this).closest('tr').find('.updateContainer')
				.prepend('<span class="replacedElement">Replaced <span class="text-muted"><em>' + existingValue + '</em></span></span>');

		jQuery(this).closest('tr').find('.matchError').remove();
		jQuery('.undoElement').off('click');
		jQuery('.undoElement').on('click', function () {
			jQuery(this).closest('tr').find('.fieldLabel')
				.append('<span class="matchError"><i class="fa fa-exclamation-circle p-lr-4 f-r"></i></span>')
			var replaceValue = jQuery(this).attr('data-value');
			jQuery(this).closest('tr').find('.fieldValue').val(replaceValue);
			jQuery(this).closest('tr').find('.replacedElement').remove();
			jQuery(this).closest('tr').find('.updateElement').removeClass('hide');
			jQuery(this).remove();
		});
	});

}

function registerListViewButton(backAllowed, contactInfo) {
	var records = getLocalStoargeValue('records');
	if (records) {
		prependElement('.bodyHeader', '<span class="backToList cursorPointer" data-contact="'+escape(JSON.stringify(contactInfo))+'"><i class="fa fa-angle-left "></i></span>&nbsp;&nbsp;');
		registerBackToListButton(records, backAllowed);
	}
}

//function to register back to list button
function registerBackToListButton(records, backAllowed) {
	jQuery('.backToList').on('click', function () {
		records = JSON.parse(records);
		var contactInfo = jQuery(this).data('contact');
		loadListView(records, backAllowed, contactInfo);
		viewContactDetails(backAllowed, contactInfo);
	});
}

//function to register back to index button
function registerBackToIndexButton() {
	jQuery('.backToIndex').on('click', function () {
		loadIndexView();
	});
}

function registerCopyHighlightedTextEvent() {
	jQuery('#createContactForm').find(':input').on('click',function(){
		var element = this;
		chrome.storage.local.get('highlightedText', function (data) {
			if (data.highlightedText) {
				jQuery(element).val(data.highlightedText);
			}
		});
	})
}

//function to load contact form and related events
function registerContactFormEvents(record, contactInfo, backAllowed) {
	var aDeferred = jQuery.Deferred();
	if(!contactInfo)
		contactInfo = getExtractedContactInfo();
	var formatting = record ? false : true;
	record = record ? record : contactInfo;
	if (formatting && !contactInfo) {
		formatting = false;
	}

	showProgressBar('body');
	loadContactForm(record, formatting).then(function (res) {
		hideProgressBar();
		addBodyHeading('Contact Details');
		registerReferenceRecordsSearchEvent();
		registerCopyHighlightedTextEvent();
		createAccount(res.accountId);
		createContact(res.contactId, backAllowed);
		aDeferred.resolve();
	});
	return aDeferred.promise();
}

//function to register view contact event
function viewContactDetails(backAllowed, contactInfo) {
	if(contactInfo){
		setLocalStoargeValue('openedContactInfo',contactInfo);
	} else {
		setLocalStoargeValue('openedContactInfo', '');
	}
	jQuery('.matchingContact').on('click', function () {
		var recordId = jQuery(this).find('.viewContact').attr('data-id');
		showProgressBar('body');
		fetchRecord(recordId).then(function (res) {
			hideProgressBar();
			if(backAllowed) {
				var contactInfo = getLocalStoargeValue('openedContactInfo');
				loadContactDetails(res.result.record, backAllowed, contactInfo);
			} else {
				var record = $.makeArray(res.result.record)[0];
				contactInfo = getExtractedContactInfo();
				registerContactFormEvents(record, contactInfo).then(function () {
					updateOrgSearchField(contactInfo['company']);
					registerListViewButton(backAllowed, contactInfo);
					registerUpdateEvent(contactInfo);
				});
			}
		});
	});
}

//function to load list view
function loadListView(records, backAllowed, contactInfo) {
	jQuery('.createNewContactContainer').removeClass('hide');
	setLocalStoargeValue('records', JSON.stringify(records));

	if(contactInfo)
		var parsedContactInfo = JSON.parse(unescape(contactInfo));

	var heading = 'Found ' + records.length + ' matching '
	heading += records.length > 1 ? 'contacts' : 'contact';

	if(backAllowed) {
		heading += ' for ';
	}
	addBodyHeading(heading);

	var listView = '<div>';

	if(backAllowed) {
		listView += '<div class="alert alert-info updateActions">'+
						'<div class="f-bl">'+
							'<div class="bold">'+parsedContactInfo['name']+'</div>'+
							'<div class="f-12">'+parsedContactInfo['title']+'</div>'+
							'<div class="text-muted f-12">'+parsedContactInfo['address']+'</div>'+
						'</div>'+
						'<p class="m-t-8"><button data-record="'+contactInfo+'" class="importRecord btn btn-sm btn-primary">Import as New</button></p>'+
					'</div>';
	}
	
	listView += '<table class="table"><tbody>';
	$.each(records, function (index, record) {
		var accountname = record.account_id.label;
		var contactname = record.firstname + ' ' + record.lastname;
		var email = record.email;
		email = email ? email : 'No email found';
		listView = listView + '<tr class="matchingContact cursorPointer"><td class="p-24-imp"><h5><strong>' + contactname + '</strong></h5>\n\
										<div class="text-muted">' + accountname + '</div>\n\
										<div class="text-muted"><small><strong><em>' + email + '</em></strong></small></div></td>';
		listView = listView + '<td class="viewContact alignMiddle cursorPointer" data-id="' + record.id + '"><i class="fa fa-angle-right"></i></td>'
	});
	listView = listView + '</tbody></table></div>';
	replaceElement('.bodyContainer', listView);

	if(backAllowed) {
		prependElement('.bodyHeader', '<span class="backToIndex cursorPointer"><i class="fa fa-angle-left "></i></span>&nbsp;&nbsp;');
		registerBackToIndexButton();
		registerImportContact();
	}
}

//function to register Logout Event
function registerLogoutEvent() {
	$('#logout').on('click', function () {
		clearLocalStorage();
		loadLoginView();
	});
}

//function to login and set necessary variables to localstorage
function doLogin(username, password) {
	showProgressBar('body');
	login(username, password).then(function (result) {
		hideProgressBar();
		if (result.success) {
			var userDetails = result.result.login;
			userDetails['crm-url'] = localStorage.getItem('crm-url');
			setLocalStoargeValue('session', userDetails.session);
			setLocalStoargeValue('userid', '19x' + userDetails.userid);
			setLocalStoargeValue('date_format', userDetails.date_format);
			setLocalStoargeValue('hour_format', userDetails.hour_format);
			setLocalStoargeValue('is_admin', userDetails.is_admin);
			setLocalStoargeValue('first_name', userDetails.first_name);
			setLocalStoargeValue('last_name', userDetails.last_name);
			setLocalStoargeValue('primary_email', userDetails.primary_email);
			setLocalStoargeValue('user_name', username);
			setLocalStoargeValue('vtiger_version', userDetails.vtiger_version);
			chrome.storage.local.set({"userDetails": userDetails}, function () { });
			loadIndexView();
		} else {
			$('#errorMessage').text("Invalid Credentials");
		}
	});
}

//function to register Login Event
function registerLoginEvent() {
	$('#loginForm').on('click', function () {
		setExtractedContactInfo();
		var username = $('[name="username"]').val();
		var password = $('[name="password"]').val();
		if (localTesting) {
			var url = 'http://localhost/v8';
			setLocalStoargeValue('crm-url', url);
			doLogin(username, password);
		} else {
			showProgressBar('body');
			resolveUrl(username, password).then(function (result) {
				hideProgressBar();
				if (result.success) {
					var url = result.result.user.url;
					setLocalStoargeValue('crm-url', url);
					doLogin(username, password);
				} else {
					$('#errorMessage').text("Invalid Credentials");
				}
			});
		}
	});
}

//function to load Login view
function loadLoginView() {
	clearLocalStorage();
	$.get("../templates/login.html", function (data) {
		$("body").html(data);
		registerLoginEvent();
	});
}

//function to register create new contact
function registerNewContactEvent() {
	var contactInfo = getExtractedContactInfo();
	jQuery('#createNewContact').on('click', function () {
		registerContactFormEvents().then(function () {
			updateOrgSearchField(contactInfo['company']);
			registerListViewButton();
		});
	});
}

function checkRecordExistsOnName(contactInfo) {
	var aDeferred = jQuery.Deferred();
	var email = contactInfo.email;
	fetchRecordFromEmail(email).then(function (result) {
		hideProgressBar();
		if (result.error && result.error.code === 1501) {
			loadLoginView();
		} else if (result.success) {
			var records = result.result.record;
			records['strong_match'] = true;
			aDeferred.resolve(records);
		} else {
			var name = contactInfo['name'].split(" ");
			showProgressBar('body');
			fetchRecordFromName(name[0], name[1], contactInfo['company']).then(function (result) {
				hideProgressBar();
				if (result.success) {
					var records = result.result.records;
					aDeferred.resolve(records);
				} else {
					aDeferred.reject();
				}
			});
		}
	});
	return aDeferred.promise();		
}

/*
 * Function to check if a record exists
 * Return Value = records if exists else null
 */
function checkRecordExists(contactInfo) {
	var aDeferred = jQuery.Deferred();
	setLocalStoargeValue('records', '');
	if(!contactInfo)
		contactInfo = getExtractedContactInfo();
	if (contactInfo) {
		showProgressBar('body');
		var extensionInstalled = getLocalStoargeValue('extensionInstalled');
		if(extensionInstalled) {
			var url = contactInfo.profileLink;
			fetchRecordFromUrl(url).then(function(result){
				hideProgressBar();
				if (result.error && result.error.code === 1501) {
					loadLoginView();
				} else if (result.success) {
					var records = result.result.record;
					records['strong_match'] = true;
					aDeferred.resolve(records);
				} else {
					checkRecordExistsOnName(contactInfo).then(function(records){
						aDeferred.resolve(records);
					}).fail(function(){
						aDeferred.reject();
					});
				}
			}).fail(function(){
				checkRecordExistsOnName(contactInfo).then(function(records){
					aDeferred.resolve(records);	
				}).fail(function(){
					aDeferred.reject();
				});
			});
		} else {
			checkRecordExistsOnName(contactInfo).then(function(records){
				aDeferred.resolve(records);
			}).fail(function(){
				aDeferred.reject();
			});
		}
	} else {
		aDeferred.reject();
	}
	return aDeferred.promise();
}

function updateOrgSearchField(value) {
	$('#account_id').on('click', function () {
		$( ".mainContainer" ).nextAll(':has(.select2-search__field):first').find('.select2-search__field').val(value).trigger('keyup');
	});
}

function loadMatchedRecords(records, backAllowed, contactInfo) {
	if (records.length > 0) {
		var length = records.length;
		if(chrome.browserAction)
			chrome.browserAction.setBadgeText({text: length.toString()});
		loadListView(records, backAllowed, contactInfo);
		viewContactDetails(backAllowed, contactInfo);
	}
}

function registerMatchedRecordClick() {
	jQuery('.matchedRecordMultiple').on('click', function(){
		replaceElement('.importAllContainer','');
		jQuery('.showSettings').addClass('hide');
		var records = JSON.parse(unescape(jQuery(this).data('records')));
		var contactInfo = jQuery(this).data('record');
		loadMatchedRecords(records, true, contactInfo);
	})
}

async function createFile(url, values){
	try{
		let response = await fetch(url);
		let data = await response.blob();
		let metadata = {
			type: 'image/jpeg'
		};
		let file = new File([data], "test.jpg", metadata);
		return {'file': file, 'values':values};
	} catch(err) {
		//ignore silently
	}
}

function createLinkingOrg(record) {
	var aDeferred = jQuery.Deferred();
	if(record['company']) {
		fetchRefernceRecords('Accounts', record['company']).then(function(searchResult) {
			var results = searchResult.result;
			if(results.length) {
				var org = results[results.length - 1]
				record['account_id'] = org.value
				aDeferred.resolve(record);
			} else {
				describe('Accounts').then(function (result) {
					if (result.success) {
						var describeResult = result.result.describe;
						var fields = describeResult.fields;
						var orgInfo = {}
						$.each(fields, function (index, value) {
							if (value['mandatory']) {
								if (value['type']['name'] == 'reference') {
									orgInfo[value['name']] = '';
								} else {
									orgInfo[value['name']] = '???';
								}
							}
						});
						var userId = getLocalStoargeValue('userid');
						orgInfo['assigned_user_id'] = userId;
						orgInfo['accountname'] = record['company']
						var id = describeResult.idPrefix + 'x0';
						values = JSON.stringify(orgInfo);
						saveRecord('Accounts', id, values).then(function (orgResult) {
							if (orgResult.success) {
								record['account_id'] = orgResult.result.record.id
								aDeferred.resolve(record);
							} else {
								aDeferred.resolve(record);
							}
						}).fail(function(error){
							aDeferred.resolve(record);
						});
					}
				}).fail(function(error){
					aDeferred.resolve(record);
				});
			}
		});
		
	} else {
		aDeferred.resolve(record);
	}
	return aDeferred.promise();
}


function importContact(record) {
	var aDeferred = jQuery.Deferred();
	createLinkingOrg(record).then(function(record){
		describe('Contacts').then(function (result) {
			if (result.success) {
				var describeResult = result.result.describe;
				var requiredFields = getRequieredFields(describeResult.fields, record);
				var formattedContactInfo = formatContactInfo(record);
				formattedContactInfo['accountname'] = record['company'];
				var userId = getLocalStoargeValue('userid');
				formattedContactInfo['assigned_user_id'] = userId;
				formattedContactInfo['source'] = record['sourceDomain'];

				formattedContactInfo['account_id'] = record['account_id'];

				$.each(requiredFields, function (index, value) {
					if (value['mandatory'] && (!formattedContactInfo[value['name']] || formattedContactInfo[value['name']] === undefined)) {
						if (value['type']['name'] == 'reference') {
							formattedContactInfo[value['name']] = '';
						} else {
							formattedContactInfo[value['name']] = '???';
						}
					}
				});

				var id = describeResult.idPrefix + 'x0';
				values = JSON.stringify(formattedContactInfo);

				createFile(record['photourl'], values).then(function(res){
					saveRecord('Contacts', id, res['values'], res['file']).then(function (result) {
						hideProgressBar();
						if (result.success) {
							aDeferred.resolve(result);
						} else {
							aDeferred.reject(result);
						}
					}).fail(function(error){
						aDeferred.reject(error);
					});
				})
			}
		});
	})
	return aDeferred.promise();
}

function registerImportContact() {
	jQuery('.importRecord').on('click', function(){
		replaceElement('.importAllContainer','');
		jQuery('.showSettings').addClass('hide');
		showProgressBar('body');
		var record = JSON.parse(unescape(jQuery(this).data('record')));
		importContact(record).then(function(result){
			loadIndexView();
		}).fail(function(result){
			showErrorMessage('.bodyContainer', result.error.message);
		})
	});
}

function registerUpdateContact() {
	jQuery('.updateRecord').on('click', function(){
		var contactInfo = JSON.parse(unescape(jQuery(this).data('record')));
		var record = JSON.parse(unescape(jQuery(this).data('crmrecord')));
		registerContactFormEvents(record, contactInfo, true).then(function () {
			updateOrgSearchField(contactInfo['company']);
			registerListViewButton(true, contactInfo);
			registerUpdateEvent(contactInfo);
		});
	});
}

function registerImportAll() {
	jQuery('#importAll').on('click', function(){
		showProgressBar('body');
		var contactInfo = getExtractedContactInfo();
		var matchedRecords = JSON.parse(getLocalStoargeValue('matchedContacts'));
		var count = contactInfo.length; 
		$.each(contactInfo, function(index, contact) {
			if(jQuery.inArray( contact['profileLink'], matchedRecords ) == -1) {
				importContact(contact).then(function(result){
					if(!--count) {
						hideProgressBar();
						loadIndexView();
					}
				}).fail(function(result){
					if(!--count) {
						hideProgressBar();
						loadIndexView();
					}
					showErrorMessage('.bodyContainer', result.error.message);
				})		
			}
		});
	});
}

function checkExtensionInstalled() {
	setLocalStoargeValue('extensionInstalled', false);
	describe('Contacts').then(function (result) {
		if (result.success) {
			var describeResult = result.result.describe;
			var describeFields = describeResult.fields;
			$.each(describeFields, function(index, value){
				if(value['name'] == 'linkedin_experience') {
					setLocalStoargeValue('extensionInstalled', true);
					return false;
				}
			});
		}
	});
}

function registerShowContactsSettings() {
	jQuery('#showUnmatched').on('change', function(){
		if(jQuery(this).is(":checked")) {
			jQuery('.matchedRecordMultiple').closest('tr').addClass('hide');
		} else {
			jQuery('.matchedRecordMultiple').closest('tr').removeClass('hide');
		}
	})
}

//function to load Index view
function loadIndexView() {
	checkExtensionInstalled();
	$.get("../templates/index.html", function (data) {
		$("body").html(data);
		jQuery('.signedinAs').append('Signed in as <strong><em>' + getLocalStoargeValue('user_name') + '</em></strong>');
		registerLogoutEvent();
		var contactInfo = getExtractedContactInfo();
		if(contactInfo['name']) {
			if(contactInfo['sourceDomain'] != 'Linkedin') {
				replaceElement('.terms','');
			}	
			registerNewContactEvent();
			chrome.storage.local.get('matchedRecords', function (data) {
				if (data.matchedRecords) {
					loadMatchedRecords(data.matchedRecords);
				} else {
					showProgressBar('body');
					checkRecordExists().then(function (records) {
						hideProgressBar();
						chrome.storage.local.set({"matchedRecords": records}, function () { });
						loadMatchedRecords(records);
					}).fail(function () {
						hideProgressBar();
						registerContactFormEvents().then(function () {
							updateOrgSearchField(contactInfo['company']);
							addBodyHeading('Create Contact','left');
							appendElement('.bodyHeader','<div class="alert alert-info alertMessage">\n\
															We couldn\'t find this contact in Vtiger. You can create one now.\n\
														</div>');
						});
					});
				}
			});	
		} else {
			setLocalStoargeValue('matchedContacts', JSON.stringify([]));
			appendElement('.bodyContainer','<div class="p-lr-8">\n\
												Please open the people search results page or Lead results page or profile page to view or import contacts in Vtiger CRM.\n\
											</div>');
			replaceElement('.createNewContactContainer','');
			var html = '<table class="multiProfileTable">';
			var matchedRecords = [];
			var count = contactInfo.length;
			chrome.storage.local.set({"matchedRecords": contactInfo}, function () { });
			$.each(contactInfo, function(index, contact) {
				var imageTag = '<div class="circle-icon user-image-sm"><i class="fa fa-user f-20"></i><div>';
				if(contact['photourl']) {
					imageTag = '<img src="'+contact['photourl']+'" class="circle-icon p-0 user-image-sm m-t-0 m-r-2 border-0">';
				}
				checkRecordExists(contact).then(function (records) {
					var importButton = '<span class="vtigerContact">View Contact</span>';
					if(!records['strong_match']) {
						var numRecords = records.length;
						importButton = 'View '+numRecords+' ';
						importButton += numRecords == 1 ? 'match' : 'matches';
					} else {
						matchedRecords.push(contact['profileLink']);
					}
					html += '<tr>'+
								'<td class="matchedRecordMultiple cursorPointer" data-records="'+escape(JSON.stringify(records))+'" style="width:40px; vertical-align:top;">'+
									imageTag+
								'</td>'+
								'<td><div class="bold">'+contact['name']+'</div>'+
									'<div class="f-12">'+contact['title']+'</div>'+
									'<div class="text-muted f-12">'+contact['address']+'</div>'+
								'</td>'+
								'<td class="matchedRecordMultiple" style="padding: 4px; text-align:right;vertical-align:top;" data-records="'+escape(JSON.stringify(records))+'" data-record="'+escape(JSON.stringify(contact))+'">'+
									'<button class="btn btn-sm btn-secondary">'+importButton+'</button>'+
								'</td>'+
							'</tr>';
					if(!--count) {
						html += '</table>';
						replaceElement('.bodyContainer', html);
						registerMatchedRecordClick();
						registerImportContact();
						setLocalStoargeValue('matchedContacts', JSON.stringify(matchedRecords));
					}	
				}).fail(function () {
					html += '<tr>'+
								'<td style="width:40px; vertical-align:top;">'+
									imageTag+
								'</td>'+
								'<td><div class="bold">'+contact['name']+'</div>'+
									'<div class="f-12">'+contact['title']+'</div>'+
									'<div class="text-muted f-12">'+contact['address']+'</div>'+
								'</td>'+
								'<td class="importRecord" data-record="'+escape(JSON.stringify(contact))+'" style="text-align:right; vertical-align:top">'+
									'<button class="btn btn-sm btn-primary">Import</button>'+
								'</td>'+
							'</tr>';
					if(!--count) {
						html += '</table>';
						replaceElement('.bodyContainer', html);
						registerMatchedRecordClick();
						registerImportContact();
						setLocalStoargeValue('matchedContacts', JSON.stringify(matchedRecords));
					}
					if(jQuery('.importAll').length == 0) {
						jQuery('.showSettings').removeClass('hide');
						registerShowContactsSettings();
						replaceElement('.importAllContainer','<button type="button" id="importAll" class="btn-lg btn-block btn-primary">Import All</button>');
						registerImportAll();
					}
				});
							
			});
		}
	});
}

var localTesting = isLocalTesting();
//set Extracted Info to localstorage
setExtractedContactInfo();

//If session doesn't exists switch to login view
setTimeout(function(){
	if (getLocalStoargeValue('session')) {
		loadIndexView();
	} else {
		loadLoginView();
	}
},1000);


chrome.storage.onChanged.addListener(function(changes, namespace) {
	if(getLocalStoargeValue('session')) {
		for (var key in changes) {
			if(key == "reload") {
				var storageChange = changes[key];
				var newValue = storageChange.newValue;
				if(newValue == 0){
					//hideProgressBar();
				} else if(newValue) {
					showProgressBar('body');
				}
			}
		}	
	}
});
