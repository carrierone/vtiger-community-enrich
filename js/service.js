function login(username, password) {
  return vtigerClient.doLogin(username, password);
}

function resolveUrl(username, password) {
  return vtigerClient.doInvoke('resolveUrl', { username, password });
}

function describe(module) {
  return vtigerClient.doDescribe(module);
}

function fetchRecordFromUrl(url) {
  return vtigerClient.doInvoke('fetchRecordFromLinkedinUrl', { url, allrecords: true });
}

function fetchRecordFromEmail(email) {
  return vtigerClient.doInvoke('fetchRecordDetailsFromEmail', { email, allrecords: true });
}

function fetchRecordFromName(firstname, lastname, accountname) {
  return vtigerClient.doInvoke('fetchRecordDetailsFromNameDetails', { firstname, lastname, accountname });
}

function saveRecord(module, record, values, imagename) {
  const formData = new FormData();
  formData.append('module', module);
  formData.append('record', record);
  formData.append('values', JSON.stringify(values));
  if (imagename) {
    formData.append('imagename[]', imagename);
  }
  return vtigerClient.doInvoke('saveRecord', formData, 'POST', false);
}

function fetchRefernceRecords(referenceModule, searchKey) {
  return vtigerClient.doInvoke('fetchReferenceRecords', { referenceModule, searchKey });
}

function fetchRecord(record) {
  return vtigerClient.doInvoke('fetchRecord', { record });
}
